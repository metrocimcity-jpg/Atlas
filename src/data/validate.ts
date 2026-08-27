import type { FileIndex } from "./types";
import { SCHEMA_VERSION } from "./types";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  index: FileIndex | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function validateNode(node: unknown, index: number): string[] {
  const errors: string[] = [];
  if (!isRecord(node)) {
    return [`items[${index}] is not an object`];
  }
  if (typeof node.id !== "string" || node.id.length === 0) {
    errors.push(`items[${index}].id must be a non-empty string`);
  }
  if (node.parentId !== null && typeof node.parentId !== "string") {
    errors.push(`items[${index}].parentId must be a string or null`);
  }
  if (typeof node.name !== "string") {
    errors.push(`items[${index}].name must be a string`);
  }
  if (node.nodeType !== "file" && node.nodeType !== "folder") {
    errors.push(`items[${index}].nodeType must be "file" or "folder"`);
  }
  if (typeof node.size !== "number" || !Number.isFinite(node.size) || node.size < 0) {
    errors.push(`items[${index}].size must be a non-negative number`);
  }
  return errors;
}

export function validateFileIndex(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: ["Index must be a JSON object"], index: null };
  }

  const schemaVersion = asString(input.schemaVersion);
  if (!schemaVersion) {
    errors.push("schemaVersion is required");
  }

  if (!isRecord(input.root) || typeof input.root.id !== "string" || typeof input.root.name !== "string") {
    errors.push("root must include id and name");
  }

  if (!Array.isArray(input.items)) {
    errors.push("items must be an array");
    return { ok: false, errors, index: null };
  }

  if (!Array.isArray(input.errors)) {
    errors.push("errors must be an array");
  }

  input.items.forEach((item, index) => {
    errors.push(...validateNode(item, index));
  });

  if (!isRecord(input.statistics)) {
    errors.push("statistics must be an object");
  }

  if (errors.length > 0) {
    return { ok: false, errors, index: null };
  }

  const migrated = migrateIndex(input as unknown as FileIndex);
  return { ok: true, errors: [], index: migrated };
}

export function migrateIndex(index: FileIndex): FileIndex {
  if (index.schemaVersion === SCHEMA_VERSION) {
    return index;
  }
  return {
    ...index,
    schemaVersion: SCHEMA_VERSION,
  };
}

export function parseIndexJson(text: string): ValidationResult {
  try {
    const parsed: unknown = JSON.parse(text);
    return validateFileIndex(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return { ok: false, errors: [message], index: null };
  }
}

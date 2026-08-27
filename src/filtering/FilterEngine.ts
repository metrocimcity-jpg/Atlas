import type { IndexNode } from "@/data/types";

export interface FilterState {
  extensions: string[];
  categories: string[];
  fileTypes: string[];
  sizeMin: number | null;
  sizeMax: number | null;
  modifiedAfter: string | null;
  modifiedBefore: string | null;
  createdAfter: string | null;
  createdBefore: string | null;
  hidden: boolean | null;
  system: boolean | null;
  readOnly: boolean | null;
  executable: boolean | null;
  symbolicLink: boolean | null;
  hasMetadata: boolean | null;
  duplicatesOnly: boolean;
  recentlyModifiedDays: number | null;
  olderThanDays: number | null;
  emptyFolders: boolean | null;
}

export const emptyFilterState = (): FilterState => ({
  extensions: [],
  categories: [],
  fileTypes: [],
  sizeMin: null,
  sizeMax: null,
  modifiedAfter: null,
  modifiedBefore: null,
  createdAfter: null,
  createdBefore: null,
  hidden: null,
  system: null,
  readOnly: null,
  executable: null,
  symbolicLink: null,
  hasMetadata: null,
  duplicatesOnly: false,
  recentlyModifiedDays: null,
  olderThanDays: null,
  emptyFolders: null,
});

export function isFilterActive(filters: FilterState): boolean {
  return (
    filters.extensions.length > 0 ||
    filters.categories.length > 0 ||
    filters.fileTypes.length > 0 ||
    filters.sizeMin !== null ||
    filters.sizeMax !== null ||
    filters.modifiedAfter !== null ||
    filters.modifiedBefore !== null ||
    filters.createdAfter !== null ||
    filters.createdBefore !== null ||
    filters.hidden !== null ||
    filters.system !== null ||
    filters.readOnly !== null ||
    filters.executable !== null ||
    filters.symbolicLink !== null ||
    filters.hasMetadata !== null ||
    filters.duplicatesOnly ||
    filters.recentlyModifiedDays !== null ||
    filters.olderThanDays !== null ||
    filters.emptyFolders !== null
  );
}

function inList(value: string | null, list: string[]): boolean {
  if (list.length === 0) {
    return true;
  }
  if (value === null) {
    return list.includes("") || list.includes("no extension");
  }
  return list.includes(value);
}

function inDateRange(value: string | null, after: string | null, before: string | null): boolean {
  if (after === null && before === null) {
    return true;
  }
  if (value === null) {
    return false;
  }
  if (after !== null && value < after) {
    return false;
  }
  if (before !== null && value > before) {
    return false;
  }
  return true;
}

function attrMatch(actual: boolean | null | undefined, expected: boolean | null): boolean {
  if (expected === null) {
    return true;
  }
  return actual === expected;
}

function daysAgoIso(days: number, now = Date.now()): string {
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
}

export function duplicateKeys(nodes: IndexNode[]): Set<string> {
  const counts = new Map<string, number>();
  for (const node of nodes) {
    if (node.nodeType !== "file" || node.size <= 0) {
      continue;
    }
    const key = `${node.name.toLowerCase()}|${node.size}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const duplicates = new Set<string>();
  for (const node of nodes) {
    if (node.nodeType !== "file") {
      continue;
    }
    const key = `${node.name.toLowerCase()}|${node.size}`;
    if ((counts.get(key) ?? 0) > 1) {
      duplicates.add(node.id);
    }
  }
  return duplicates;
}

export class FilterEngine {
  apply(nodes: IndexNode[], filters: FilterState, now = Date.now()): Set<string> {
    const duplicates = filters.duplicatesOnly ? duplicateKeys(nodes) : null;
    const recentCutoff =
      filters.recentlyModifiedDays !== null ? daysAgoIso(filters.recentlyModifiedDays, now) : null;
    const oldCutoff = filters.olderThanDays !== null ? daysAgoIso(filters.olderThanDays, now) : null;
    const matched = new Set<string>();

    for (const node of nodes) {
      if (node.nodeType === "folder") {
        if (filters.emptyFolders === true && (node.stats?.fileCount ?? 0) !== 0) {
          continue;
        }
        if (filters.emptyFolders === false && (node.stats?.fileCount ?? 0) === 0) {
          continue;
        }
        if (
          filters.extensions.length === 0 &&
          filters.categories.length === 0 &&
          filters.fileTypes.length === 0 &&
          filters.sizeMin === null &&
          filters.sizeMax === null &&
          !filters.duplicatesOnly
        ) {
          matched.add(node.id);
        }
        continue;
      }

      if (!inList(node.extension, filters.extensions)) {
        continue;
      }
      if (!inList(node.category, filters.categories)) {
        continue;
      }
      if (!inList(node.fileType, filters.fileTypes)) {
        continue;
      }
      if (filters.sizeMin !== null && node.size < filters.sizeMin) {
        continue;
      }
      if (filters.sizeMax !== null && node.size > filters.sizeMax) {
        continue;
      }
      if (!inDateRange(node.modifiedAt, filters.modifiedAfter, filters.modifiedBefore)) {
        continue;
      }
      if (!inDateRange(node.createdAt, filters.createdAfter, filters.createdBefore)) {
        continue;
      }
      if (!attrMatch(node.attributes?.hidden, filters.hidden)) {
        continue;
      }
      if (!attrMatch(node.attributes?.system, filters.system)) {
        continue;
      }
      if (!attrMatch(node.attributes?.readOnly, filters.readOnly)) {
        continue;
      }
      if (!attrMatch(node.attributes?.executable, filters.executable)) {
        continue;
      }
      if (!attrMatch(node.attributes?.symbolicLink, filters.symbolicLink)) {
        continue;
      }
      if (filters.hasMetadata === true && (node.metadata === undefined || Object.keys(node.metadata).length === 0)) {
        continue;
      }
      if (filters.hasMetadata === false && node.metadata && Object.keys(node.metadata).length > 0) {
        continue;
      }
      if (duplicates && !duplicates.has(node.id)) {
        continue;
      }
      if (recentCutoff !== null && (node.modifiedAt === null || node.modifiedAt < recentCutoff)) {
        continue;
      }
      if (oldCutoff !== null && (node.modifiedAt === null || node.modifiedAt > oldCutoff)) {
        continue;
      }
      matched.add(node.id);
    }

    return matched;
  }
}

export const defaultFilterEngine = new FilterEngine();

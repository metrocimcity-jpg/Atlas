import type { IndexNode } from "@/data/types";
import { parseHumanSize, parseQuery, type ParsedQuery } from "./parseQuery";
import { fuzzyScore } from "./fuzzy";

export interface SearchHit {
  id: string;
  score: number;
}

export interface SearchEngine {
  search(nodes: IndexNode[], query: string): SearchHit[];
}

function metadataValue(node: IndexNode, field: string): string | number | null {
  const value = node.metadata?.[field];
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function fieldValue(node: IndexNode, field: string): string | number | null {
  switch (field) {
    case "extension":
      return node.extension;
    case "fileType":
      return node.fileType;
    case "category":
      return node.category;
    case "size":
      return node.size;
    case "modifiedAt":
      return node.modifiedAt;
    case "createdAt":
      return node.createdAt;
    case "name":
      return node.name;
    case "path":
      return node.relativePath;
    default:
      return metadataValue(node, field);
  }
}

function matchField(node: IndexNode, term: Extract<ParsedQuery["terms"][number], { kind: "field" }>): boolean {
  const actual = fieldValue(node, term.field);
  if (term.field === "size") {
    const expected = parseHumanSize(term.value);
    if (expected === null || typeof actual !== "number") {
      return false;
    }
    if (term.operator === "gt") {
      return actual > expected;
    }
    if (term.operator === "lt") {
      return actual < expected;
    }
    return actual === expected;
  }

  if (actual === null) {
    return false;
  }
  const actualText = String(actual).toLowerCase();
  const expected = term.value.toLowerCase();
  if (term.operator === "gt") {
    return actualText > expected;
  }
  if (term.operator === "lt") {
    return actualText < expected;
  }
  return actualText.includes(expected);
}

function textHaystack(node: IndexNode): string {
  const metadataText = node.metadata
    ? Object.values(node.metadata)
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value))
        .join(" ")
    : "";
  return [
    node.name,
    node.relativePath,
    node.path,
    node.extension ?? "",
    node.fileType ?? "",
    node.category ?? "",
    node.subcategory ?? "",
    metadataText,
  ]
    .join(" ")
    .toLowerCase();
}

export class IndexedSearchEngine implements SearchEngine {
  search(nodes: IndexNode[], query: string): SearchHit[] {
    const parsed = parseQuery(query);
    if (parsed.terms.length === 0) {
      return nodes.map((node) => ({ id: node.id, score: 1 }));
    }

    const hits: SearchHit[] = [];
    for (const node of nodes) {
      const termScores: number[] = [];
      for (const term of parsed.terms) {
        if (term.kind === "field") {
          termScores.push(matchField(node, term) ? 1 : 0);
          continue;
        }
        const haystack = textHaystack(node);
        if (haystack.includes(term.value.toLowerCase())) {
          termScores.push(1.4);
          continue;
        }
        const nameScore = fuzzyScore(term.value, node.name);
        const pathScore = fuzzyScore(term.value, node.relativePath);
        termScores.push(Math.max(nameScore, pathScore));
      }

      const matched =
        parsed.combinator === "or" ? termScores.some((score) => score > 0) : termScores.every((score) => score > 0);
      if (!matched) {
        continue;
      }
      const score = termScores.reduce((sum, value) => sum + value, 0);
      hits.push({ id: node.id, score });
    }

    return hits.sort((a, b) => b.score - a.score);
  }
}

export const defaultSearchEngine = new IndexedSearchEngine();

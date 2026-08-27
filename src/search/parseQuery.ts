export interface ParsedQuery {
  terms: QueryTerm[];
  combinator: "and" | "or";
}

export type QueryTerm =
  | { kind: "text"; value: string }
  | { kind: "field"; field: string; operator: "eq" | "gt" | "lt"; value: string };

const FIELD_ALIASES: Record<string, string> = {
  ext: "extension",
  extension: "extension",
  type: "fileType",
  filetype: "fileType",
  category: "category",
  cat: "category",
  size: "size",
  modified: "modifiedAt",
  created: "createdAt",
  name: "name",
  path: "path",
};

export function parseQuery(input: string): ParsedQuery {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { terms: [], combinator: "and" };
  }

  const tokens = tokenize(trimmed);
  let combinator: "and" | "or" = "and";
  const terms: QueryTerm[] = [];

  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (upper === "AND") {
      combinator = "and";
      continue;
    }
    if (upper === "OR") {
      combinator = "or";
      continue;
    }
    const fieldMatch = /^([a-zA-Z]+):(>=|<=|>|<)?(.+)$/.exec(token);
    if (fieldMatch) {
      const rawField = fieldMatch[1].toLowerCase();
      const field = FIELD_ALIASES[rawField];
      if (field) {
        const opSymbol = fieldMatch[2] ?? "";
        const operator = opSymbol === ">" || opSymbol === ">=" ? "gt" : opSymbol === "<" || opSymbol === "<=" ? "lt" : "eq";
        terms.push({ kind: "field", field, operator, value: stripQuotes(fieldMatch[3]) });
        continue;
      }
    }
    terms.push({ kind: "text", value: stripQuotes(token) });
  }

  return { terms, combinator };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quoting = false;
  for (const char of input) {
    if (char === '"') {
      quoting = !quoting;
      continue;
    }
    if (!quoting && /\s/.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

function stripQuotes(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseHumanSize(input: string): number | null {
  const match = /^([0-9]*\.?[0-9]+)\s*(b|kb|mb|gb|tb)?$/i.exec(input.trim());
  if (!match) {
    return null;
  }
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    return null;
  }
  const unit = (match[2] ?? "b").toLowerCase();
  const multipliers: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
  };
  return amount * (multipliers[unit] ?? 1);
}

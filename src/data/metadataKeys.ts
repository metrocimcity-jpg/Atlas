import type { FileIndex } from "./types";

/** Collect unique metadata property names present on file nodes. */
export function collectMetadataKeys(index: FileIndex | null | undefined): string[] {
  if (!index) {
    return [];
  }
  const keys = new Set<string>();
  for (const item of index.items) {
    if (item.nodeType !== "file" || !item.metadata) {
      continue;
    }
    for (const key of Object.keys(item.metadata)) {
      keys.add(key);
    }
  }
  return [...keys].sort((a, b) => a.localeCompare(b));
}

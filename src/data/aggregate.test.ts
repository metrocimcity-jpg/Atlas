import { describe, expect, it } from "vitest";
import { buildFileIndex } from "@/data/aggregate";
import { parseIndexJson, validateFileIndex } from "@/data/validate";
import type { RawScanEntry } from "@/data/types";

function entry(relativePath: string, nodeType: "file" | "folder", size = 0): RawScanEntry {
  return {
    relativePath,
    name: relativePath.split("/").at(-1) ?? relativePath,
    nodeType,
    size,
    createdAt: null,
    modifiedAt: "2026-01-01T00:00:00.000Z",
    accessedAt: null,
    attributes: null,
    mimeHint: null,
  };
}

describe("buildFileIndex", () => {
  it("aggregates folder statistics from files", () => {
    const index = buildFileIndex({
      rootName: "proj",
      rootPath: "proj",
      entries: [entry("CAD", "folder"), entry("CAD/a.dwg", "file", 100), entry("CAD/b.dwg", "file", 50)],
    });
    const cad = index.items.find((item) => item.relativePath === "CAD");
    expect(cad?.stats?.fileCount).toBe(2);
    expect(cad?.stats?.totalSize).toBe(150);
    expect(index.statistics.totalFiles).toBe(2);
    expect(index.schemaVersion).toBe("1.0");
  });
});

describe("validateFileIndex", () => {
  it("rejects malformed JSON objects", () => {
    expect(validateFileIndex(null).ok).toBe(false);
    expect(validateFileIndex({ schemaVersion: "1.0" }).ok).toBe(false);
  });

  it("parses a valid serialized index", () => {
    const index = buildFileIndex({
      rootName: "root",
      rootPath: "root",
      entries: [entry("readme.md", "file", 12)],
    });
    const parsed = parseIndexJson(JSON.stringify(index));
    expect(parsed.ok).toBe(true);
    expect(parsed.index?.statistics.totalFiles).toBe(1);
  });

  it("handles malformed JSON text", () => {
    expect(parseIndexJson("{not json").ok).toBe(false);
  });
});

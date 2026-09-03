import { describe, expect, it } from "vitest";
import { buildFileIndex } from "@/data/aggregate";
import { mergeFileIndexes, uniqueBatchName } from "@/data/mergeIndex";
import type { RawScanEntry } from "@/data/types";

function entry(relativePath: string, nodeType: "file" | "folder", size = 0): RawScanEntry {
  return {
    relativePath,
    name: relativePath.includes("/") ? relativePath.slice(relativePath.lastIndexOf("/") + 1) : relativePath,
    nodeType,
    size,
    createdAt: null,
    modifiedAt: "2026-01-01T00:00:00.000Z",
    accessedAt: null,
    attributes: null,
    mimeHint: null,
  };
}

describe("uniqueBatchName", () => {
  it("keeps the original name when free", () => {
    expect(uniqueBatchName("Project A", ["Other"])).toBe("Project A");
  });

  it("suffixes on collision", () => {
    expect(uniqueBatchName("Project A", ["Project A", "Project A (2)"])).toBe("Project A (3)");
  });
});

describe("mergeFileIndexes", () => {
  it("returns incoming when base is empty", () => {
    const incoming = buildFileIndex({
      rootName: "Batch1",
      rootPath: "Batch1",
      entries: [entry("a.rvt", "file", 10)],
    });
    const result = mergeFileIndexes(null, new Map(), incoming, new Map());
    expect(result.batchName).toBe("Batch1");
    expect(result.index.statistics.totalFiles).toBe(1);
  });

  it("nests the second batch under a unique top-level folder", () => {
    const base = buildFileIndex({
      rootName: "Merged",
      rootPath: "Merged",
      entries: [entry("first", "folder"), entry("first/a.dwg", "file", 100)],
    });
    const incoming = buildFileIndex({
      rootName: "ACC-Docs",
      rootPath: "ACC-Docs",
      entries: [entry("Archive", "folder"), entry("Archive/b.rvt", "file", 50)],
    });
    const handles = new Map<string, FileSystemHandle>([
      ["Archive/b.rvt", { kind: "file" } as FileSystemFileHandle],
    ]);

    const result = mergeFileIndexes(base, new Map(), incoming, handles);
    expect(result.batchName).toBe("ACC-Docs");
    expect(result.index.statistics.totalFiles).toBe(2);
    expect(result.index.items.some((item) => item.relativePath === "ACC-Docs/Archive/b.rvt")).toBe(true);
    expect(result.handles.has("ACC-Docs/Archive/b.rvt")).toBe(true);
    expect(result.handles.has("Archive/b.rvt")).toBe(false);
  });

  it("avoids colliding batch names", () => {
    const base = buildFileIndex({
      rootName: "Root",
      rootPath: "Root",
      entries: [entry("Site", "folder"), entry("Site/a.txt", "file", 1)],
    });
    const incoming = buildFileIndex({
      rootName: "Site",
      rootPath: "Site",
      entries: [entry("b.txt", "file", 2)],
    });
    const result = mergeFileIndexes(base, new Map(), incoming, new Map());
    expect(result.batchName).toBe("Site (2)");
    expect(result.index.items.some((item) => item.relativePath === "Site (2)/b.txt")).toBe(true);
  });
});

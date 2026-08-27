import { describe, expect, it } from "vitest";
import { parseHumanSize, parseQuery } from "@/search/parseQuery";
import { fuzzyScore } from "@/search/fuzzy";
import { IndexedSearchEngine } from "@/search/SearchEngine";
import type { IndexNode } from "@/data/types";

describe("parseQuery", () => {
  it("parses field terms and free text", () => {
    const parsed = parseQuery("ext:dwg type:CAD name:bridge OR path:civil");
    expect(parsed.combinator).toBe("or");
    expect(parsed.terms.some((term) => term.kind === "field" && term.field === "extension" && term.value === "dwg")).toBe(
      true,
    );
  });

  it("parses size operators", () => {
    const parsed = parseQuery("size:>100MB");
    expect(parsed.terms[0]).toMatchObject({ kind: "field", field: "size", operator: "gt", value: "100MB" });
    expect(parseHumanSize("100MB")).toBe(100 * 1024 * 1024);
  });
});

describe("fuzzyScore", () => {
  it("scores substrings above fuzzy matches", () => {
    expect(fuzzyScore("bridge", "Harbor-Bridge.rvt")).toBeGreaterThan(fuzzyScore("brdg", "Harbor-Bridge.rvt"));
    expect(fuzzyScore("xyz", "Harbor-Bridge.rvt")).toBe(0);
  });
});

describe("IndexedSearchEngine", () => {
  const engine = new IndexedSearchEngine();
  const nodes: IndexNode[] = [
    {
      id: "1",
      parentId: "/",
      name: "Harbor-Arch.rvt",
      path: "BIM/Harbor-Arch.rvt",
      relativePath: "BIM/Harbor-Arch.rvt",
      nodeType: "file",
      extension: "rvt",
      mimeType: null,
      fileType: "Revit Model",
      category: "BIM",
      subcategory: "Model",
      size: 1000,
      createdAt: null,
      modifiedAt: "2026-02-01T00:00:00.000Z",
      accessedAt: null,
      attributes: null,
    },
    {
      id: "2",
      parentId: "/",
      name: "Alignment.dwg",
      path: "CAD/Alignment.dwg",
      relativePath: "CAD/Alignment.dwg",
      nodeType: "file",
      extension: "dwg",
      mimeType: null,
      fileType: "AutoCAD Drawing",
      category: "CAD",
      subcategory: "Drawing",
      size: 50,
      createdAt: null,
      modifiedAt: "2026-02-01T00:00:00.000Z",
      accessedAt: null,
      attributes: null,
    },
  ];

  it("matches filenames and paths", () => {
    expect(engine.search(nodes, "Harbor").map((hit) => hit.id)).toEqual(["1"]);
    expect(engine.search(nodes, "CAD").map((hit) => hit.id)).toContain("2");
  });

  it("supports advanced syntax", () => {
    expect(engine.search(nodes, "ext:dwg").map((hit) => hit.id)).toEqual(["2"]);
    expect(engine.search(nodes, "category:BIM AND name:harbor").map((hit) => hit.id)).toEqual(["1"]);
    expect(engine.search(nodes, "size:>500").map((hit) => hit.id)).toEqual(["1"]);
  });
});

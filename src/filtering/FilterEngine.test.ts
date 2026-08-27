import { describe, expect, it } from "vitest";
import { defaultFilterEngine, emptyFilterState } from "@/filtering/FilterEngine";
import type { IndexNode } from "@/data/types";

function file(partial: Partial<IndexNode> & Pick<IndexNode, "id" | "name">): IndexNode {
  return {
    parentId: "/",
    path: partial.name,
    relativePath: partial.name,
    nodeType: "file",
    extension: "dwg",
    mimeType: null,
    fileType: "AutoCAD Drawing",
    category: "CAD",
    subcategory: "Drawing",
    size: 100,
    createdAt: "2024-01-01T00:00:00.000Z",
    modifiedAt: "2026-06-01T00:00:00.000Z",
    accessedAt: null,
    attributes: {
      hidden: false,
      system: false,
      readOnly: false,
      executable: false,
      symbolicLink: false,
    },
    ...partial,
  };
}

describe("FilterEngine", () => {
  const nodes: IndexNode[] = [
    file({ id: "a", name: "a.dwg", extension: "dwg", category: "CAD", size: 200 }),
    file({ id: "b", name: "b.rvt", extension: "rvt", category: "BIM", fileType: "Revit Model", size: 5000 }),
    file({
      id: "c",
      name: "c.pdf",
      extension: "pdf",
      category: "PDF",
      fileType: "PDF Document",
      size: 20,
      modifiedAt: "2020-01-01T00:00:00.000Z",
    }),
  ];

  it("filters by category and extension", () => {
    const filters = { ...emptyFilterState(), categories: ["BIM"] };
    expect([...defaultFilterEngine.apply(nodes, filters)]).toEqual(["b"]);
    const byExt = { ...emptyFilterState(), extensions: ["dwg"] };
    expect([...defaultFilterEngine.apply(nodes, byExt)]).toEqual(["a"]);
  });

  it("filters by size and modified date", () => {
    const size = { ...emptyFilterState(), sizeMin: 1000 };
    expect([...defaultFilterEngine.apply(nodes, size)]).toEqual(["b"]);
    const old = { ...emptyFilterState(), modifiedBefore: "2021-01-01T00:00:00.000Z" };
    expect([...defaultFilterEngine.apply(nodes, old)]).toEqual(["c"]);
  });

  it("combines filters", () => {
    const filters = { ...emptyFilterState(), categories: ["CAD", "BIM"], sizeMax: 300 };
    expect([...defaultFilterEngine.apply(nodes, filters)]).toEqual(["a"]);
  });
});

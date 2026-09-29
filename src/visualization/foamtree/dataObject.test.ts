import { describe, expect, it } from "vitest";
import { buildFileIndex } from "@/data/aggregate";
import { buildGroupedTree } from "@/visualization/grouping";
import { foamLayoutOptions, toFoamTreeData } from "@/visualization/foamtree/dataObject";
import { defaultAppConfig } from "@/config/defaults";
import type { RawScanEntry } from "@/data/types";

function file(relativePath: string, size: number): RawScanEntry {
  return {
    relativePath,
    name: relativePath.split("/").at(-1) ?? relativePath,
    nodeType: "file",
    size,
    createdAt: null,
    modifiedAt: null,
    accessedAt: null,
    attributes: null,
    mimeHint: null,
  };
}

describe("FoamTree data adapter", () => {
  it("converts a grouped tree into FoamTree groups with weights", () => {
    const index = buildFileIndex({
      rootName: "p",
      rootPath: "p",
      entries: [file("a.rvt", 10), file("b.dwg", 20), file("c.dwg", 5)],
    });
    const visible = new Set(index.items.filter((item) => item.nodeType === "file").map((item) => item.id));
    const tree = buildGroupedTree(index, visible, ["category"], "fileSize", "");
    const data = toFoamTreeData(tree, defaultAppConfig().visualization);
    expect(data.groups?.length).toBeGreaterThan(0);
    expect(data.groups?.every((group) => typeof group.weight === "number")).toBe(true);
    expect(data.groups?.some((group) => Array.isArray(group.groups) && group.groups.length > 0)).toBe(true);
  });

  it("maps Prisma layouts to FoamTree layout and stacking", () => {
    expect(foamLayoutOptions("foam")).toMatchObject({ layout: "relaxed", stacking: "hierarchical" });
    expect(foamLayoutOptions("treemap")).toMatchObject({ layout: "squarified" });
    expect(foamLayoutOptions("sunburst")).toMatchObject({ stacking: "flattened" });
  });
});

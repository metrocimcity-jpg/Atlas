import { defaultColorMapper } from "@/visualization/ColorMapper";
import { FOLDER_FILL } from "@/visualization/palettes";
import type { ColorBy, LayoutMode, VisualizationConfig, VizNode } from "@/visualization/types";
import type { FoamTreeDataObject, FoamTreeGroup } from "@carrotsearch/foamtree";

interface Extents {
  minSize: number;
  maxSize: number;
  oldest: number;
  newest: number;
}

export interface AtlasFoamGroup extends FoamTreeGroup {
  id: string;
  label: string;
  weight: number;
  sourceId: string | null;
  size: number;
  nodeType: VizNode["nodeType"];
  isFile: boolean;
  color?: string;
  groups?: AtlasFoamGroup[];
}

function collectExtents(node: VizNode, extents: Extents): void {
  extents.minSize = Math.min(extents.minSize, Math.max(node.size, 1));
  extents.maxSize = Math.max(extents.maxSize, node.size);
  if (node.modifiedAt) {
    const time = new Date(node.modifiedAt).getTime();
    if (Number.isFinite(time)) {
      extents.oldest = Math.min(extents.oldest, time);
      extents.newest = Math.max(extents.newest, time);
    }
  }
  for (const child of node.children) {
    collectExtents(child, extents);
  }
}

function colorFor(node: VizNode, config: VisualizationConfig, extents: Extents): string {
  if (node.nodeType !== "file") {
    return FOLDER_FILL;
  }
  return defaultColorMapper.color({
    node: {
      colorKey: node.colorKey,
      category: node.category,
      size: node.size,
      extension: node.extension,
      modifiedAt: node.modifiedAt,
    },
    colorBy: config.colorBy as ColorBy,
    palette: config.palette,
    minSize: extents.minSize,
    maxSize: extents.maxSize,
    oldest: extents.oldest,
    newest: extents.newest,
    customProperty: config.customProperty,
  });
}

function toGroup(node: VizNode, config: VisualizationConfig, extents: Extents): AtlasFoamGroup {
  const group: AtlasFoamGroup = {
    id: node.id,
    label: node.label,
    weight: Math.max(node.weight, 0.0001),
    sourceId: node.sourceId,
    size: node.size,
    nodeType: node.nodeType,
    isFile: node.nodeType === "file",
    ...(config.style.colorModel === "atlas" ? { color: colorFor(node, config, extents) } : {}),
  };
  if (node.children.length > 0) {
    group.groups = node.children.map((child) => toGroup(child, config, extents));
  }
  return group;
}

export function toFoamTreeData(root: VizNode, config: VisualizationConfig): FoamTreeDataObject {
  const extents: Extents = { minSize: Infinity, maxSize: 1, oldest: Infinity, newest: 0 };
  collectExtents(root, extents);
  if (!Number.isFinite(extents.minSize)) {
    extents.minSize = 1;
  }
  if (!Number.isFinite(extents.oldest)) {
    extents.oldest = 0;
    extents.newest = 1;
  }
  const groups = root.children.length > 0
    ? root.children.map((child) => toGroup(child, config, extents))
    : [toGroup(root, config, extents)];
  return { groups };
}

export function findFoamGroupBySourceId(groups: AtlasFoamGroup[] | undefined, sourceId: string): AtlasFoamGroup | null {
  if (!groups) {
    return null;
  }
  for (const group of groups) {
    if (group.sourceId === sourceId || group.id === sourceId) {
      return group;
    }
    const nested = findFoamGroupBySourceId(group.groups, sourceId);
    if (nested) {
      return nested;
    }
  }
  return null;
}

export function foamLayoutOptions(layout: LayoutMode): {
  layout: "relaxed" | "ordered" | "squarified";
  stacking: "hierarchical" | "flattened";
  relaxationInitializer: "fisheye" | "blackhole" | "ordered" | "squarified" | "random";
} {
  switch (layout) {
    case "treemap":
      return { layout: "squarified", stacking: "hierarchical", relaxationInitializer: "squarified" };
    case "circles":
      return { layout: "relaxed", stacking: "hierarchical", relaxationInitializer: "fisheye" };
    case "sunburst":
      return { layout: "relaxed", stacking: "flattened", relaxationInitializer: "ordered" };
    case "foam":
    default:
      return { layout: "relaxed", stacking: "hierarchical", relaxationInitializer: "ordered" };
  }
}

import type { ColorBy, LayoutCell, Rect, VisualizationConfig, VisualizationEngine, VizNode } from "./types";
import { defaultColorMapper } from "./ColorMapper";
import { squarify } from "./layout/squarify";

function colorFor(node: VizNode, config: VisualizationConfig, extents: Extents): string {
  return defaultColorMapper.color({
    node: {
      colorKey: node.colorKey,
      category: node.category,
      size: node.size,
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

interface Extents {
  minSize: number;
  maxSize: number;
  oldest: number;
  newest: number;
}

function collectExtents(node: VizNode, extents: Extents): void {
  extents.minSize = Math.min(extents.minSize, Math.max(node.size, 1));
  extents.maxSize = Math.max(extents.maxSize, node.size);
  for (const child of node.children) {
    collectExtents(child, extents);
  }
}

function layoutChildren(
  node: VizNode,
  bounds: Rect,
  depth: number,
  config: VisualizationConfig,
  extents: Extents,
): LayoutCell[] {
  if (node.children.length === 0) {
    return [];
  }
  const pad = (config.style.groupInsetWidth ?? 6) + 0;
  const inner: Rect = {
    x: bounds.x + pad,
    y: bounds.y + pad,
    w: Math.max(bounds.w - pad * 2, 1),
    h: Math.max(bounds.h - pad * 2, 1),
  };
  const packed = squarify(
    node.children.map((child) => ({ item: child, weight: child.weight })),
    inner,
  );
  return packed.map(({ item, rect }) => {
    const cell: LayoutCell = {
      id: item.id,
      sourceId: item.sourceId,
      label: item.label,
      rect,
      depth,
      color: colorFor(item, config, extents),
      weight: item.weight,
      size: item.size,
      nodeType: item.nodeType,
      parentId: node.id,
    };
    if (item.children.length > 0 && rect.w * rect.h > 2400) {
      cell.inner = layoutChildren(item, rect, depth + 1, config, extents).slice(0, 48);
    }
    return cell;
  });
}

export class FoamEngine implements VisualizationEngine {
  readonly id = "foam" as const;

  layout(root: VizNode, bounds: Rect, config: VisualizationConfig): LayoutCell[] {
    const extents: Extents = { minSize: Infinity, maxSize: 1, oldest: 0, newest: 1 };
    collectExtents(root, extents);
    if (!Number.isFinite(extents.minSize)) {
      extents.minSize = 1;
    }
    return layoutChildren(root, bounds, 0, config, extents);
  }
}

export class TreemapEngine implements VisualizationEngine {
  readonly id = "treemap" as const;

  layout(root: VizNode, bounds: Rect, config: VisualizationConfig): LayoutCell[] {
    return new FoamEngine().layout(root, bounds, config);
  }
}

export class CirclePackEngine implements VisualizationEngine {
  readonly id = "circles" as const;

  layout(root: VizNode, bounds: Rect, config: VisualizationConfig): LayoutCell[] {
    const extents: Extents = { minSize: Infinity, maxSize: 1, oldest: 0, newest: 1 };
    collectExtents(root, extents);
    if (!Number.isFinite(extents.minSize)) {
      extents.minSize = 1;
    }
    const cx = bounds.x + bounds.w / 2;
    const cy = bounds.y + bounds.h / 2;
    const maxR = Math.min(bounds.w, bounds.h) / 2 - 8;
    const children = [...root.children].sort((a, b) => b.weight - a.weight);
    const total = children.reduce((sum, child) => sum + child.weight, 0) || 1;
    const cells: LayoutCell[] = [];
    let angle = -Math.PI / 2;
    for (const child of children) {
      const share = child.weight / total;
      const r = Math.max(Math.sqrt(share) * maxR * 0.55, 8);
      const orbit = maxR - r;
      const x = cx + Math.cos(angle) * orbit * 0.55 - r;
      const y = cy + Math.sin(angle) * orbit * 0.55 - r;
      cells.push({
        id: child.id,
        sourceId: child.sourceId,
        label: child.label,
        rect: { x, y, w: r * 2, h: r * 2 },
        depth: 0,
        color: colorFor(child, config, extents),
        weight: child.weight,
        size: child.size,
        nodeType: child.nodeType,
        parentId: root.id,
      });
      angle += share * Math.PI * 2;
    }
    return cells;
  }
}

export class SunburstEngine implements VisualizationEngine {
  readonly id = "sunburst" as const;

  layout(root: VizNode, bounds: Rect, config: VisualizationConfig): LayoutCell[] {
    const extents: Extents = { minSize: Infinity, maxSize: 1, oldest: 0, newest: 1 };
    collectExtents(root, extents);
    if (!Number.isFinite(extents.minSize)) {
      extents.minSize = 1;
    }
    const cells: LayoutCell[] = [];
    const cx = bounds.x + bounds.w / 2;
    const cy = bounds.y + bounds.h / 2;
    const radius = Math.min(bounds.w, bounds.h) / 2 - 12;
    const total = root.children.reduce((sum, child) => sum + child.weight, 0) || 1;
    let angle = -Math.PI / 2;
    for (const child of root.children) {
      const slice = (child.weight / total) * Math.PI * 2;
      const inner = radius * 0.35;
      const outer = radius * 0.92;
      const mid = angle + slice / 2;
      const r = (inner + outer) / 2;
      const w = Math.max(outer - inner, 8);
      const x = cx + Math.cos(mid) * r - w / 2;
      const y = cy + Math.sin(mid) * r - w / 2;
      cells.push({
        id: child.id,
        sourceId: child.sourceId,
        label: child.label,
        rect: { x, y, w, h: w },
        depth: 0,
        color: colorFor(child, config, extents),
        weight: child.weight,
        size: child.size,
        nodeType: child.nodeType,
        parentId: root.id,
      });
      angle += slice;
    }
    return cells;
  }
}

export function engineFor(mode: VisualizationConfig["layout"]): VisualizationEngine {
  switch (mode) {
    case "treemap":
      return new TreemapEngine();
    case "circles":
      return new CirclePackEngine();
    case "sunburst":
      return new SunburstEngine();
    case "foam":
    default:
      return new FoamEngine();
  }
}

import type { IndexNode } from "@/data/types";
import { hashString } from "@/utils/format";
import { CATEGORY_COLORS, DATE_SCALE, SIZE_SCALE, colorForExt, mixHex, paletteColors } from "./palettes";
import type { ColorBy, PaletteId } from "./types";

export interface ColorMapperInput {
  node: IndexNode | {
    colorKey: string;
    category: string | null;
    size: number;
    extension?: string | null;
    modifiedAt?: string | null;
    createdAt?: string | null;
    attributes?: IndexNode["attributes"];
    parentId?: string | null;
    metadata?: Record<string, unknown>;
  };
  colorBy: ColorBy;
  palette: PaletteId;
  minSize: number;
  maxSize: number;
  oldest: number;
  newest: number;
  customProperty: string;
}

export interface ColorMapper {
  color(input: ColorMapperInput): string;
}

function sequential(t: number, from: string, to: string): string {
  return mixHex(from, to, Math.min(Math.max(t, 0), 1));
}

function heatmap(t: number, palette: PaletteId): string {
  const colors = paletteColors(palette === "heatmap" ? "heatmap" : "heatmap");
  const clamped = Math.min(Math.max(t, 0), 1);
  const scaled = clamped * (colors.length - 1);
  const index = Math.floor(scaled);
  const next = Math.min(index + 1, colors.length - 1);
  return mixHex(colors[index], colors[next], scaled - index);
}

function categorical(key: string, palette: PaletteId): string {
  if (key in CATEGORY_COLORS && (palette === "professional" || palette === "engineering" || palette === "bim" || palette === "cad" || palette === "rainbow" || palette === "dark")) {
    return CATEGORY_COLORS[key];
  }
  const colors = paletteColors(palette);
  const index = hashString(key) % colors.length;
  return colors[index];
}

export class DefaultColorMapper implements ColorMapper {
  color(input: ColorMapperInput): string {
    const node = input.node;
    switch (input.colorBy) {
      case "fileSize": {
        const minLog = Math.log(Math.max(input.minSize, 0) + 1);
        const maxLog = Math.log(Math.max(input.maxSize, 0) + 1);
        const t = maxLog > minLog ? (Math.log(Math.max(node.size, 0) + 1) - minLog) / (maxLog - minLog) : 0;
        return input.palette === "heatmap" ? heatmap(t, input.palette) : sequential(t, SIZE_SCALE.from, SIZE_SCALE.to);
      }
      case "modifiedDate":
      case "createdDate":
      case "age": {
        const stamp =
          "modifiedAt" in node
            ? (input.colorBy === "createdDate" ? node.createdAt : node.modifiedAt)
            : null;
        if (!stamp) {
          return categorical("unknown", input.palette);
        }
        const time = new Date(stamp).getTime();
        const span = Math.max(input.newest - input.oldest, 1);
        const t = input.colorBy === "age" ? (input.newest - time) / span : (time - input.oldest) / span;
        return input.palette === "heatmap" ? heatmap(t, input.palette) : sequential(t, DATE_SCALE.from, DATE_SCALE.to);
      }
      case "attributes": {
        const hidden = "attributes" in node ? node.attributes?.hidden : null;
        return categorical(hidden ? "hidden" : "visible", input.palette);
      }
      case "folder":
        return categorical(("parentId" in node ? node.parentId : null) ?? "root", input.palette);
      case "custom": {
        const fromMeta =
          "metadata" in node && node.metadata && input.customProperty in node.metadata
            ? String(node.metadata[input.customProperty])
            : null;
        const fromKey = "colorKey" in node ? node.colorKey : null;
        return categorical(fromMeta || fromKey || "custom", input.palette);
      }
      case "extension":
        return colorForExt("extension" in node ? node.extension : null);
      case "fileType":
      case "mimeType":
      case "category":
      default: {
        const colorKey = "colorKey" in node ? node.colorKey : (node.category ?? node.extension ?? "other");
        if (node.category && (input.colorBy === "category" || input.colorBy === "fileType")) {
          return categorical(node.category, input.palette);
        }
        if (input.colorBy === "mimeType" || input.colorBy === "fileType") {
          return colorForExt("extension" in node ? node.extension : colorKey);
        }
        return categorical(colorKey || "other", input.palette);
      }
    }
  }
}

export const defaultColorMapper = new DefaultColorMapper();

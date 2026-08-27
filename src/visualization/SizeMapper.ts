import type { IndexNode } from "@/data/types";
import type { SizeBy, VizNode } from "./types";

export interface SizeMapper {
  weight(node: IndexNode, sizeBy: SizeBy, customProperty: string, now?: number): number;
}

function customNumber(node: IndexNode, property: string): number {
  const value = node.metadata?.[property];
  return typeof value === "number" && Number.isFinite(value) ? Math.max(value, 0) : 0;
}

export class DefaultSizeMapper implements SizeMapper {
  weight(node: IndexNode, sizeBy: SizeBy, customProperty: string, now = Date.now()): number {
    switch (sizeBy) {
      case "equal":
        return 1;
      case "fileCount":
        return node.nodeType === "folder" ? Math.max(node.stats?.fileCount ?? 1, 1) : 1;
      case "age": {
        if (node.modifiedAt === null) {
          return 1;
        }
        const ageDays = Math.max((now - new Date(node.modifiedAt).getTime()) / (1000 * 60 * 60 * 24), 0.1);
        return ageDays;
      }
      case "custom":
        return customNumber(node, customProperty) || 1;
      case "folderSize":
      case "fileSize":
      default:
        return Math.max(node.size, 1);
    }
  }
}

export const defaultSizeMapper = new DefaultSizeMapper();

export function vizWeight(node: VizNode): number {
  return Math.max(node.weight, 0.0001);
}

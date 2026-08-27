import type { VizNode } from "@/visualization/types";

export function findVizNode(root: VizNode, id: string): VizNode | null {
  if (root.id === id) {
    return root;
  }
  for (const child of root.children) {
    const found = findVizNode(child, id);
    if (found) {
      return found;
    }
  }
  return null;
}

export function focusedVizNode(root: VizNode, path: string[]): VizNode {
  let current = root;
  for (const id of path) {
    const next = current.children.find((child) => child.id === id) ?? findVizNode(root, id);
    if (!next) {
      break;
    }
    current = next;
  }
  return current;
}

import { createNodeId, joinRelativePath } from "@/data/ids";
import type { FileIndex, FolderStats, IndexNode, IndexStatistics, ScanError } from "@/data/types";
import type { HandleMap } from "@/scanner/FileScanner";

export interface MergeIndexesResult {
  index: FileIndex;
  handles: HandleMap;
  batchName: string;
}

function emptyStats(): FolderStats {
  return {
    fileCount: 0,
    folderCount: 0,
    totalSize: 0,
    categoryCounts: {},
    extensionCounts: {},
    largestFileId: null,
    newestFileId: null,
    oldestFileId: null,
  };
}

function incrementCount(map: Record<string, number>, key: string | null): void {
  if (!key) {
    return;
  }
  map[key] = (map[key] ?? 0) + 1;
}

function mergeCounts(target: Record<string, number>, source: Record<string, number>): void {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

function sanitizeBatchName(name: string): string {
  const cleaned = name.trim().replace(/[\\/]+/g, "-");
  return cleaned.length > 0 ? cleaned : "batch";
}

/** Pick a unique top-level batch folder name under the existing root. */
export function uniqueBatchName(desired: string, existingTopLevelNames: Iterable<string>): string {
  const base = sanitizeBatchName(desired);
  const taken = new Set([...existingTopLevelNames].map((name) => name.toLowerCase()));
  if (!taken.has(base.toLowerCase())) {
    return base;
  }
  let index = 2;
  while (taken.has(`${base} (${index})`.toLowerCase())) {
    index += 1;
  }
  return `${base} (${index})`;
}

function topLevelNames(index: FileIndex): string[] {
  return index.items
    .filter((item) => item.parentId === index.root.id && item.nodeType === "folder")
    .map((item) => item.name);
}

function recomputeStatistics(items: IndexNode[], rootId: string, errors: ScanError[]): IndexStatistics {
  const byId = new Map(items.map((item) => [item.id, { ...item }]));
  const children = new Map<string, IndexNode[]>();
  for (const item of byId.values()) {
    if (!item.parentId) {
      continue;
    }
    const list = children.get(item.parentId) ?? [];
    list.push(item);
    children.set(item.parentId, list);
  }
  const fileById = new Map(
    [...byId.values()].filter((item) => item.nodeType === "file").map((item) => [item.id, item]),
  );

  function aggregate(node: IndexNode): FolderStats {
    if (node.nodeType === "file") {
      return emptyStats();
    }
    const stats = emptyStats();
    let largestSize = -1;
    let newest: { id: string; at: string } | null = null;
    let oldest: { id: string; at: string } | null = null;

    for (const child of children.get(node.id) ?? []) {
      if (child.nodeType === "file") {
        stats.fileCount += 1;
        stats.totalSize += child.size;
        incrementCount(stats.categoryCounts, child.category);
        incrementCount(stats.extensionCounts, child.extension);
        if (child.size > largestSize) {
          largestSize = child.size;
          stats.largestFileId = child.id;
        }
        if (child.modifiedAt) {
          if (!newest || child.modifiedAt > newest.at) {
            newest = { id: child.id, at: child.modifiedAt };
          }
          if (!oldest || child.modifiedAt < oldest.at) {
            oldest = { id: child.id, at: child.modifiedAt };
          }
        }
      } else {
        const childStats = aggregate(child);
        stats.fileCount += childStats.fileCount;
        stats.folderCount += childStats.folderCount + 1;
        stats.totalSize += childStats.totalSize;
        mergeCounts(stats.categoryCounts, childStats.categoryCounts);
        mergeCounts(stats.extensionCounts, childStats.extensionCounts);
        const largest = childStats.largestFileId ? fileById.get(childStats.largestFileId) : undefined;
        if (largest && largest.size > largestSize) {
          largestSize = largest.size;
          stats.largestFileId = largest.id;
        }
        const newestChild = childStats.newestFileId ? fileById.get(childStats.newestFileId) : undefined;
        if (newestChild?.modifiedAt && (!newest || newestChild.modifiedAt > newest.at)) {
          newest = { id: newestChild.id, at: newestChild.modifiedAt };
        }
        const oldestChild = childStats.oldestFileId ? fileById.get(childStats.oldestFileId) : undefined;
        if (oldestChild?.modifiedAt && (!oldest || oldestChild.modifiedAt < oldest.at)) {
          oldest = { id: oldestChild.id, at: oldestChild.modifiedAt };
        }
      }
    }

    stats.newestFileId = newest?.id ?? null;
    stats.oldestFileId = oldest?.id ?? null;
    node.stats = stats;
    node.size = stats.totalSize;
    byId.set(node.id, node);
    return stats;
  }

  const root = byId.get(rootId);
  if (root) {
    aggregate(root);
  }

  for (let i = 0; i < items.length; i += 1) {
    const updated = byId.get(items[i].id);
    if (updated) {
      items[i] = updated;
    }
  }

  const rootStats = byId.get(rootId)?.stats ?? emptyStats();
  return {
    totalFiles: rootStats.fileCount,
    totalFolders: rootStats.folderCount,
    totalSize: rootStats.totalSize,
    errorCount: errors.length,
    categoryCounts: { ...rootStats.categoryCounts },
    extensionCounts: { ...rootStats.extensionCounts },
    largestFileId: rootStats.largestFileId,
    newestFileId: rootStats.newestFileId,
    oldestFileId: rootStats.oldestFileId,
  };
}

/**
 * Merge `incoming` into `base` under a unique top-level batch folder.
 * File handles are remapped to the new node ids.
 */
export function mergeFileIndexes(
  base: FileIndex | null,
  baseHandles: HandleMap,
  incoming: FileIndex,
  incomingHandles: HandleMap,
  desiredBatchName?: string,
): MergeIndexesResult {
  if (!base) {
    return {
      index: incoming,
      handles: new Map(incomingHandles),
      batchName: incoming.root.name,
    };
  }

  const batchName = uniqueBatchName(desiredBatchName ?? incoming.root.name, topLevelNames(base));
  const batchId = createNodeId(batchName);
  const idMap = new Map<string, string>();
  idMap.set(incoming.root.id, batchId);

  const batchFolder: IndexNode = {
    id: batchId,
    parentId: base.root.id,
    name: batchName,
    path: base.root.path ? `${base.root.path}/${batchName}` : batchName,
    relativePath: batchName,
    nodeType: "folder",
    extension: null,
    mimeType: null,
    fileType: "Folder",
    category: null,
    subcategory: null,
    size: 0,
    createdAt: null,
    modifiedAt: incoming.generatedAt,
    accessedAt: null,
    attributes: null,
    metadata: {
      batchSource: incoming.root.path || incoming.root.name,
      batchGeneratedAt: incoming.generatedAt,
    },
    stats: emptyStats(),
  };

  for (const item of incoming.items) {
    if (item.id === incoming.root.id) {
      continue;
    }
    const newRelativePath = joinRelativePath(batchName, item.relativePath);
    idMap.set(item.id, createNodeId(newRelativePath));
  }

  const remapped: IndexNode[] = [];
  for (const item of incoming.items) {
    if (item.id === incoming.root.id) {
      continue;
    }
    const newId = idMap.get(item.id);
    if (!newId) {
      continue;
    }
    const newParentId =
      item.parentId === null || item.parentId === incoming.root.id
        ? batchId
        : (idMap.get(item.parentId) ?? batchId);
    const newRelativePath = joinRelativePath(batchName, item.relativePath);
    remapped.push({
      ...item,
      id: newId,
      parentId: newParentId,
      relativePath: newRelativePath,
      path: base.root.path ? `${base.root.path}/${newRelativePath}` : newRelativePath,
      stats: item.nodeType === "folder" ? emptyStats() : item.stats,
    });
  }

  const mergedErrors: ScanError[] = [
    ...base.errors,
    ...incoming.errors.map((error) => ({
      ...error,
      path: error.path ? `${batchName}/${error.path}` : batchName,
    })),
  ];

  const mergedItems: IndexNode[] = [
    ...base.items.map((item) => ({
      ...item,
      stats: item.nodeType === "folder" ? emptyStats() : item.stats,
    })),
    batchFolder,
    ...remapped,
  ];

  const statistics = recomputeStatistics(mergedItems, base.root.id, mergedErrors);

  const mergedHandles: HandleMap = new Map(baseHandles);
  for (const [oldId, handle] of incomingHandles) {
    const newId = idMap.get(oldId);
    if (newId) {
      mergedHandles.set(newId, handle);
    }
  }

  return {
    batchName,
    handles: mergedHandles,
    index: {
      schemaVersion: base.schemaVersion,
      generatedAt: new Date().toISOString(),
      generatorVersion: base.generatorVersion,
      root: base.root,
      statistics,
      items: mergedItems,
      errors: mergedErrors,
    },
  };
}

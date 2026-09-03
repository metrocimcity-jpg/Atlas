import { buildFileIndex } from "@/data/aggregate";
import { joinRelativePath } from "@/data/ids";
import type { FileIndex, RawScanEntry } from "@/data/types";
import type { DriveWalkCancel, DriveWalkProgress, GraphDrive, GraphDriveItem, GraphSite } from "@/sharepoint/graph";
import { walkDriveItems } from "@/sharepoint/graph";

export interface ImportDriveResult {
  index: FileIndex;
  site: GraphSite;
  drive: GraphDrive;
}

function relativePathForItem(item: GraphDriveItem, driveName: string): string | null {
  const parentPath = item.parentReference?.path;
  if (!parentPath) {
    return item.name;
  }
  // parentReference.path looks like: /drives/{id}/root: or /drives/{id}/root:/Folder
  const marker = "/root:";
  const idx = parentPath.indexOf(marker);
  if (idx < 0) {
    return item.name;
  }
  const underRoot = parentPath.slice(idx + marker.length).replace(/^\/+/, "");
  if (!underRoot) {
    return item.name;
  }
  // Sometimes Graph includes the library name as the first segment.
  const segments = underRoot.split("/").filter(Boolean);
  if (segments[0]?.toLowerCase() === driveName.toLowerCase()) {
    segments.shift();
  }
  return joinRelativePath(segments.join("/"), item.name);
}

function ensureAncestorFolders(entries: Map<string, RawScanEntry>, relativePath: string): void {
  const parts = relativePath.split("/").filter(Boolean);
  let current = "";
  for (let i = 0; i < parts.length - 1; i += 1) {
    current = current ? `${current}/${parts[i]}` : parts[i];
    if (entries.has(current)) {
      continue;
    }
    entries.set(current, {
      relativePath: current,
      name: parts[i],
      nodeType: "folder",
      size: 0,
      createdAt: null,
      modifiedAt: null,
      accessedAt: null,
      attributes: null,
      mimeHint: null,
    });
  }
}

export function driveItemsToFileIndex(
  items: GraphDriveItem[],
  options: { rootName: string; rootPath: string; driveName: string },
): FileIndex {
  const entryMap = new Map<string, RawScanEntry>();
  const metadataByPath = new Map<string, Record<string, unknown>>();

  for (const item of items) {
    const relativePath = relativePathForItem(item, options.driveName);
    if (!relativePath) {
      continue;
    }
    ensureAncestorFolders(entryMap, relativePath);
    const isFolder = Boolean(item.folder);
    entryMap.set(relativePath, {
      relativePath,
      name: item.name,
      nodeType: isFolder ? "folder" : "file",
      size: isFolder ? 0 : (item.size ?? 0),
      createdAt: item.createdDateTime ?? null,
      modifiedAt: item.lastModifiedDateTime ?? null,
      accessedAt: null,
      attributes: null,
      mimeHint: item.file?.mimeType ?? null,
    });
    if (item.webUrl) {
      metadataByPath.set(relativePath, {
        webUrl: item.webUrl,
        driveItemId: item.id,
        source: "sharepoint",
      });
    }
  }

  const index = buildFileIndex({
    rootName: options.rootName,
    rootPath: options.rootPath,
    entries: [...entryMap.values()],
  });

  index.items = index.items.map((node) => {
    if (node.relativePath === "") {
      return {
        ...node,
        metadata: {
          ...(node.metadata ?? {}),
          webUrl: options.rootPath,
          source: "sharepoint",
        },
      };
    }
    const meta = metadataByPath.get(node.relativePath);
    return meta ? { ...node, metadata: { ...(node.metadata ?? {}), ...meta } } : node;
  });

  return index;
}

export async function importSharePointDrive(
  site: GraphSite,
  drive: GraphDrive,
  options: {
    onProgress?: (progress: DriveWalkProgress) => void;
    isCancelled?: DriveWalkCancel;
  } = {},
): Promise<ImportDriveResult> {
  const items = await walkDriveItems(drive.id, options);
  const rootName = drive.name || site.displayName || "SharePoint";
  const rootPath = drive.webUrl || site.webUrl || rootName;
  const index = driveItemsToFileIndex(items, {
    rootName,
    rootPath,
    driveName: drive.name,
  });
  return { index, site, drive };
}

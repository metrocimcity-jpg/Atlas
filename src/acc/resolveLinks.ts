import { listFolderContents, listTopFolders, type AccFolderContentItem } from "@/acc/dataManagement";
import { buildAccDocsUrl } from "@/acc/urls";
import type { FileIndex, IndexNode } from "@/data/types";

export interface AccResolveProgress {
  resolved: number;
  total: number;
  currentPath: string;
  message: string;
}

function normalizeSegment(value: string): string {
  return value.trim().toLowerCase();
}

function findChild(items: AccFolderContentItem[], name: string, type?: "folders" | "items"): AccFolderContentItem | null {
  const target = normalizeSegment(name);
  const matches = items.filter((item) => normalizeSegment(item.displayName) === target);
  if (type) {
    return matches.find((item) => item.type === type) ?? null;
  }
  return matches[0] ?? null;
}

/**
 * Walk ACC folder tree to match Prisma relative paths and attach `metadata.accUrl`.
 */
export async function resolveAccLinks(
  index: FileIndex,
  projectId: string,
  onProgress?: (progress: AccResolveProgress) => void,
): Promise<{ index: FileIndex; resolved: number; missing: number }> {
  const files = index.items.filter((item) => item.nodeType === "file");
  const total = files.length;
  let resolved = 0;
  let missing = 0;

  const topFolders = await listTopFolders(projectId);
  const projectFiles =
    findChild(topFolders, "Project Files", "folders") ??
    findChild(topFolders, "Project Files") ??
    topFolders.find((item) => item.type === "folders") ??
    null;
  if (!projectFiles) {
    throw new Error("Could not find an ACC top folder (expected Project Files).");
  }

  const cache = new Map<string, AccFolderContentItem[]>();
  const load = async (folderId: string): Promise<AccFolderContentItem[]> => {
    const cached = cache.get(folderId);
    if (cached) {
      return cached;
    }
    const contents = await listFolderContents(projectId, folderId);
    cache.set(folderId, contents);
    return contents;
  };

  const byId = new Map<string, IndexNode>();
  for (const item of index.items) {
    byId.set(item.id, item);
  }

  for (const file of files) {
    onProgress?.({
      resolved,
      total,
      currentPath: file.relativePath,
      message: `Resolving ACC link ${resolved + 1}/${total}`,
    });

    const segments = file.relativePath.split("/").filter(Boolean);
    // If the scan root already is Project Files contents, segments are under Project Files.
    // If scan root includes Project Files as first segment, skip it.
    const pathSegments =
      segments[0] && normalizeSegment(segments[0]) === "project files" ? segments.slice(1) : segments;

    let folderId = projectFiles.id;
    let parentFolderUrn = projectFiles.id;
    let failed = false;

    for (let i = 0; i < pathSegments.length - 1; i += 1) {
      const contents = await load(folderId);
      const child = findChild(contents, pathSegments[i], "folders") ?? findChild(contents, pathSegments[i]);
      if (!child || child.type !== "folders") {
        failed = true;
        break;
      }
      folderId = child.id;
      parentFolderUrn = child.id;
    }

    if (failed || pathSegments.length === 0) {
      missing += 1;
      continue;
    }

    const fileName = pathSegments[pathSegments.length - 1];
    const contents = await load(folderId);
    const item = findChild(contents, fileName, "items") ?? findChild(contents, fileName);
    if (!item || item.type === "folders") {
      missing += 1;
      continue;
    }

    const accUrl = buildAccDocsUrl({
      projectId,
      entityId: item.id,
      folderUrn: parentFolderUrn,
    });
    const current = byId.get(file.id);
    if (current) {
      byId.set(file.id, {
        ...current,
        metadata: {
          ...(current.metadata ?? {}),
          accUrl,
          entityId: item.id,
          folderUrn: parentFolderUrn,
        },
      });
    }
    resolved += 1;
  }

  onProgress?.({
    resolved,
    total,
    currentPath: "",
    message: `Resolved ${resolved} of ${total} ACC links`,
  });

  return {
    index: {
      ...index,
      items: index.items.map((item) => byId.get(item.id) ?? item),
    },
    resolved,
    missing,
  };
}

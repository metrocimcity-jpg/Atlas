const DB_NAME = "prisma-local-folders";
const STORE = "directories";

export interface LocalFileRef {
  id: string;
  relativePath: string;
  name: string;
}

/** Paths to try inside a re-picked folder. JSON indexes do not store file handles. */
export function localOpenPathCandidates(node: LocalFileRef, rootName: string): string[] {
  const candidates: string[] = [];
  const push = (value: string): void => {
    const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
    if (normalized.length === 0 || normalized === "/" || candidates.includes(normalized)) {
      return;
    }
    candidates.push(normalized);
  };

  push(node.relativePath);
  if (node.id !== "/") {
    push(node.id);
  }
  const prefix = `${rootName}/`;
  for (const value of [...candidates]) {
    if (value.startsWith(prefix)) {
      push(value.slice(prefix.length));
    }
  }
  return candidates;
}

export function directoryHandleKey(index: { root: { name: string }; generatedAt: string }): string {
  return `${index.root.name}\u0000${index.generatedAt}`;
}

export async function resolveFileLocation(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<{ parent: FileSystemDirectoryHandle; file: FileSystemFileHandle } | null> {
  const parts = relativePath.split("/").filter((part) => part.length > 0 && part !== ".");
  if (parts.length === 0) {
    return null;
  }
  let parent = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    try {
      parent = await parent.getDirectoryHandle(parts[index]!);
    } catch {
      return null;
    }
  }
  try {
    const file = await parent.getFileHandle(parts[parts.length - 1]!);
    return { parent, file };
  } catch {
    return null;
  }
}

export async function resolveFileHandle(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<FileSystemFileHandle | null> {
  const located = await resolveFileLocation(root, relativePath);
  return located?.file ?? null;
}

export async function resolveFileInFolder(
  folder: FileSystemDirectoryHandle,
  node: LocalFileRef,
  rootName: string,
): Promise<{ directory: FileSystemDirectoryHandle; parent: FileSystemDirectoryHandle; file: FileSystemFileHandle } | null> {
  const candidates = localOpenPathCandidates(node, rootName);
  const roots: FileSystemDirectoryHandle[] = [folder];
  if (folder.name !== rootName) {
    try {
      roots.push(await folder.getDirectoryHandle(rootName));
    } catch {
      // The picked folder is not a parent of the scanned root.
    }
  }
  for (const directory of roots) {
    for (const relativePath of candidates) {
      const located = await resolveFileLocation(directory, relativePath);
      if (located) {
        return { directory, parent: located.parent, file: located.file };
      }
    }
  }
  return null;
}

type PermissionHandle = FileSystemHandle & {
  queryPermission?: (options?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (options?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
};

export async function ensureReadPermission(handle: FileSystemHandle): Promise<boolean> {
  const target = handle as PermissionHandle;
  try {
    if (typeof target.queryPermission === "function") {
      const current = await target.queryPermission({ mode: "read" });
      if (current === "granted") {
        return true;
      }
    }
    if (typeof target.requestPermission === "function") {
      const next = await target.requestPermission({ mode: "read" });
      return next === "granted";
    }
    return true;
  } catch {
    return false;
  }
}

function openHandleDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open folder-link database"));
  });
}

export async function saveDirectoryHandle(key: string, handle: FileSystemDirectoryHandle): Promise<void> {
  if (typeof indexedDB === "undefined") {
    return;
  }
  const db = await openHandleDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(handle, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Could not save folder link"));
  });
  db.close();
}

export async function loadDirectoryHandle(key: string): Promise<FileSystemDirectoryHandle | null> {
  if (typeof indexedDB === "undefined") {
    return null;
  }
  try {
    const db = await openHandleDb();
    const handle = await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(key);
      request.onsuccess = () => resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("Could not read folder link"));
    });
    db.close();
    return handle;
  } catch {
    return null;
  }
}

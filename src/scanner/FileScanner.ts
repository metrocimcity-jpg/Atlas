import type { FileAttributes, FileIndex, RawScanEntry, ScanError, ScanProgress } from "@/data/types";
import { buildFileIndex } from "@/data/aggregate";
import { createNodeId, joinRelativePath } from "@/data/ids";

export type HandleMap = Map<string, FileSystemHandle>;

export interface ScanResult {
  index: FileIndex;
  handles: HandleMap;
}

export interface FileScanner {
  scan(
    source: FileSystemDirectoryHandle,
    options: {
      signal?: AbortSignal;
      followSymlinks?: boolean;
      onProgress?: (progress: ScanProgress) => void;
    },
  ): Promise<ScanResult>;
}

function hiddenFromName(name: string): boolean {
  return name.startsWith(".") || name.startsWith("$");
}

function nowIso(): string {
  return new Date().toISOString();
}

async function* iterateEntries(
  handle: FileSystemDirectoryHandle,
): AsyncGenerator<[string, FileSystemHandle], void, undefined> {
  const directory = handle as FileSystemDirectoryHandle & {
    entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
  };
  for await (const entry of directory.entries()) {
    yield entry;
  }
}

export class BrowserFileScanner implements FileScanner {
  async scan(
    source: FileSystemDirectoryHandle,
    options: {
      signal?: AbortSignal;
      followSymlinks?: boolean;
      onProgress?: (progress: ScanProgress) => void;
    },
  ): Promise<ScanResult> {
    const startedAt = performance.now();
    const entries: RawScanEntry[] = [];
    const errors: ScanError[] = [];
    const handles: HandleMap = new Map();
    let filesScanned = 0;
    let foldersScanned = 1;
    let totalSize = 0;

    const emit = (phase: ScanProgress["phase"], currentPath: string): void => {
      options.onProgress?.({
        currentPath,
        filesScanned,
        foldersScanned,
        totalSize,
        errors: errors.length,
        elapsedMs: performance.now() - startedAt,
        phase,
      });
    };

    const walk = async (directory: FileSystemDirectoryHandle, relativePath: string): Promise<void> => {
      if (options.signal?.aborted) {
        throw new DOMException("Scan cancelled", "AbortError");
      }

      try {
        for await (const [name, handle] of iterateEntries(directory)) {
          if (options.signal?.aborted) {
            throw new DOMException("Scan cancelled", "AbortError");
          }
          const childRelative = joinRelativePath(relativePath, name);
          if (handle.kind === "directory") {
            foldersScanned += 1;
            handles.set(createNodeId(childRelative), handle);
            entries.push({
              relativePath: childRelative,
              name,
              nodeType: "folder",
              size: 0,
              createdAt: null,
              modifiedAt: null,
              accessedAt: null,
              attributes: {
                hidden: hiddenFromName(name),
                system: null,
                readOnly: null,
                executable: null,
                symbolicLink: null,
              },
              mimeHint: null,
            });
            emit("scanning", childRelative);
            await walk(handle as FileSystemDirectoryHandle, childRelative);
          } else {
            try {
              const file = await (handle as FileSystemFileHandle).getFile();
              handles.set(createNodeId(childRelative), handle);
              filesScanned += 1;
              totalSize += file.size;
              const attributes: FileAttributes = {
                hidden: hiddenFromName(name),
                system: null,
                readOnly: null,
                executable: null,
                symbolicLink: null,
              };
              entries.push({
                relativePath: childRelative,
                name,
                nodeType: "file",
                size: file.size,
                createdAt: null,
                modifiedAt: Number.isFinite(file.lastModified)
                  ? new Date(file.lastModified).toISOString()
                  : null,
                accessedAt: null,
                attributes,
                mimeHint: file.type.length > 0 ? file.type : null,
              });
              if (filesScanned % 50 === 0) {
                emit("scanning", childRelative);
                await yieldToMain();
              }
            } catch (error) {
              errors.push(toScanError(childRelative, "stat", error));
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }
        errors.push(toScanError(relativePath || source.name, "readdir", error));
      }
    };

    emit("preparing", source.name);
    await walk(source, "");
    emit("aggregating", source.name);

    handles.set(createNodeId(""), source);
    const index = buildFileIndex({
      rootName: source.name,
      rootPath: source.name,
      entries,
      errors,
    });
    emit("complete", source.name);
    return { index, handles };
  }
}

function toScanError(path: string, operation: string, error: unknown): ScanError {
  const message = error instanceof Error ? error.message : String(error);
  const errorCode = error instanceof DOMException ? error.name : null;
  return {
    path,
    operation,
    errorCode,
    message,
    timestamp: nowIso(),
  };
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export const defaultScanner = new BrowserFileScanner();

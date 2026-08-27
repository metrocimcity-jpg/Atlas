import type { FileIndex, ScanProgress } from "@/data/types";
import { defaultScanner, type HandleMap } from "@/scanner/FileScanner";

export interface ScanJob {
  cancel: () => void;
  done: Promise<{ index: FileIndex; handles: HandleMap }>;
}

export function startDirectoryScan(
  handle: FileSystemDirectoryHandle,
  onProgress: (progress: ScanProgress) => void,
): ScanJob {
  const controller = new AbortController();
  const done = defaultScanner.scan(handle, {
    signal: controller.signal,
    onProgress,
  });
  return {
    cancel: () => controller.abort(),
    done,
  };
}

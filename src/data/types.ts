export const SCHEMA_VERSION = "1.0" as const;
export const GENERATOR_VERSION = "0.1.0";

export type NodeType = "file" | "folder";

export type FileCategory =
  | "CAD"
  | "BIM"
  | "GIS"
  | "Engineering"
  | "Documents"
  | "Spreadsheets"
  | "Presentations"
  | "PDF"
  | "Images"
  | "Video"
  | "Audio"
  | "Archives"
  | "Programming"
  | "Data"
  | "Database"
  | "Web"
  | "3D"
  | "Fonts"
  | "Executables"
  | "System"
  | "Configuration"
  | "Other";

export interface FileAttributes {
  hidden: boolean | null;
  system: boolean | null;
  readOnly: boolean | null;
  executable: boolean | null;
  symbolicLink: boolean | null;
}

export interface FolderStats {
  fileCount: number;
  folderCount: number;
  totalSize: number;
  categoryCounts: Record<string, number>;
  extensionCounts: Record<string, number>;
  largestFileId: string | null;
  newestFileId: string | null;
  oldestFileId: string | null;
}

export interface IndexNode {
  id: string;
  parentId: string | null;
  name: string;
  path: string;
  relativePath: string;
  nodeType: NodeType;
  extension: string | null;
  mimeType: string | null;
  fileType: string | null;
  category: string | null;
  subcategory: string | null;
  size: number;
  createdAt: string | null;
  modifiedAt: string | null;
  accessedAt: string | null;
  attributes: FileAttributes | null;
  metadata?: Record<string, unknown>;
  stats?: FolderStats;
}

export interface IndexRoot {
  id: string;
  name: string;
  path: string;
}

export interface IndexStatistics {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  errorCount: number;
  categoryCounts: Record<string, number>;
  extensionCounts: Record<string, number>;
  largestFileId: string | null;
  newestFileId: string | null;
  oldestFileId: string | null;
}

export interface ScanError {
  path: string;
  operation: string;
  errorCode: string | null;
  message: string;
  timestamp: string;
}

export interface FileIndex {
  schemaVersion: string;
  generatedAt: string;
  generatorVersion: string;
  root: IndexRoot;
  statistics: IndexStatistics;
  items: IndexNode[];
  errors: ScanError[];
}

export interface RawScanEntry {
  relativePath: string;
  name: string;
  nodeType: NodeType;
  size: number;
  createdAt: string | null;
  modifiedAt: string | null;
  accessedAt: string | null;
  attributes: FileAttributes | null;
  mimeHint: string | null;
}

export interface ScanProgress {
  currentPath: string;
  filesScanned: number;
  foldersScanned: number;
  totalSize: number;
  errors: number;
  elapsedMs: number;
  phase: "preparing" | "scanning" | "aggregating" | "complete" | "cancelled";
}

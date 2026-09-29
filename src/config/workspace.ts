import type { FilterState } from "@/filtering/FilterEngine";
import type { AppConfig, ThemeId } from "./defaults";

export interface WorkspaceFile {
  kind: "prisma-workspace";
  version: "1.0";
  indexName: string | null;
  indexGeneratedAt: string | null;
  search: string;
  selectedId: string | null;
  focusPath: string[];
  filters: FilterState;
  config: AppConfig;
  panels: {
    filters: boolean;
    details: boolean;
  };
}

export function createWorkspace(input: {
  indexName: string | null;
  indexGeneratedAt: string | null;
  search: string;
  selectedId: string | null;
  focusPath: string[];
  filters: FilterState;
  config: AppConfig;
  panels: { filters: boolean; details: boolean };
}): WorkspaceFile {
  return {
    kind: "prisma-workspace",
    version: "1.0",
    ...input,
  };
}

export function isWorkspaceFile(value: unknown): value is WorkspaceFile {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as WorkspaceFile).kind === "prisma-workspace" &&
    (value as WorkspaceFile).version === "1.0"
  );
}

export type { ThemeId };

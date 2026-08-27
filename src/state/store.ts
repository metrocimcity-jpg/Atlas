import type { FileIndex, IndexNode, ScanProgress } from "@/data/types";
import { indexToCsv, serializeIndex } from "@/data/aggregate";
import { parseIndexJson } from "@/data/validate";
import { createSampleIndex } from "@/data/sampleIndex";
import { cloneConfig, defaultAppConfig, type AppConfig, type SavedPreset } from "@/config/defaults";
import { builtinPresets } from "@/config/presets";
import { createWorkspace, isWorkspaceFile, type WorkspaceFile } from "@/config/workspace";
import { defaultFilterEngine, emptyFilterState, isFilterActive, type FilterState } from "@/filtering/FilterEngine";
import { defaultSearchEngine } from "@/search/SearchEngine";
import { startDirectoryScan } from "@/scanner/scanJob";
import type { HandleMap } from "@/scanner/FileScanner";
import { downloadText } from "@/utils/format";
import { buildGroupedTree } from "@/visualization/grouping";
import { applyStylePreset as composeStylePreset, stylePresets } from "@/visualization/foamtree/stylePresets";
import type { VisualizationStyle, VizNode } from "@/visualization/types";
import { useSyncExternalStore } from "react";

export interface AtlasState {
  index: FileIndex | null;
  handles: HandleMap;
  scan: ScanProgress | null;
  scanning: boolean;
  loadError: string | null;
  selectedId: string | null;
  hoveredId: string | null;
  focusPath: string[];
  search: string;
  filters: FilterState;
  config: AppConfig;
  panels: { filters: boolean; details: boolean; settings: boolean; commandPalette: boolean };
  presets: SavedPreset[];
  visibleIds: Set<string>;
  visibleCount: number;
  vizTree: VizNode | null;
}

const listeners = new Set<() => void>();

let scanCancel: (() => void) | null = null;

let state: AtlasState = {
  index: null,
  handles: new Map(),
  scan: null,
  scanning: false,
  loadError: null,
  selectedId: null,
  hoveredId: null,
  focusPath: [],
  search: "",
  filters: emptyFilterState(),
  config: defaultAppConfig(),
  panels: { filters: true, details: true, settings: true, commandPalette: false },
  presets: builtinPresets,
  visibleIds: new Set(),
  visibleCount: 0,
  vizTree: null,
};

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setState(partial: Partial<AtlasState>): void {
  state = { ...state, ...partial };
  emit();
}

function nodeMap(index: FileIndex): Map<string, IndexNode> {
  return new Map(index.items.map((item) => [item.id, item]));
}

function expandAncestors(index: FileIndex, ids: Set<string>): Set<string> {
  const byId = nodeMap(index);
  const visible = new Set(ids);
  for (const id of ids) {
    let current = byId.get(id);
    while (current?.parentId) {
      visible.add(current.parentId);
      current = byId.get(current.parentId);
    }
  }
  visible.add(index.root.id);
  return visible;
}

function recompute(next: Partial<AtlasState> = {}): void {
  const merged: AtlasState = { ...state, ...next };
  if (!merged.index) {
    state = {
      ...merged,
      visibleIds: new Set(),
      visibleCount: 0,
      vizTree: null,
    };
    emit();
    return;
  }

  const items = merged.index.items;
  const filterIds = defaultFilterEngine.apply(items, merged.filters);
  const searchHits = merged.search.trim().length > 0 ? defaultSearchEngine.search(items, merged.search) : null;
  const searchIds = searchHits ? new Set(searchHits.map((hit) => hit.id)) : null;
  const files = items.filter((item) => item.nodeType === "file");
  const matchedFiles = new Set<string>();
  for (const file of files) {
    const passesFilter = !isFilterActive(merged.filters) || filterIds.has(file.id);
    const passesSearch = searchIds === null || searchIds.has(file.id);
    if (passesFilter && passesSearch) {
      matchedFiles.add(file.id);
    }
  }
  if (searchIds) {
    for (const id of searchIds) {
      const node = items.find((item) => item.id === id);
      if (node?.nodeType === "folder") {
        matchedFiles.add(id);
      }
    }
  }
  const visibleIds = expandAncestors(merged.index, matchedFiles);
  const vizTree = buildGroupedTree(
    merged.index,
    visibleIds,
    merged.config.visualization.groupBy,
    merged.config.visualization.sizeBy,
    merged.config.visualization.customProperty,
  );
  state = {
    ...merged,
    visibleIds,
    visibleCount: matchedFiles.size,
    vizTree,
  };
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): AtlasState {
  return state;
}

export function useAtlas(): AtlasState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export const actions = {
  setSearch(search: string): void {
    recompute({ search });
  },
  setFilters(filters: FilterState): void {
    recompute({ filters, focusPath: [] });
  },
  patchFilters(patch: Partial<FilterState>): void {
    recompute({ filters: { ...state.filters, ...patch }, focusPath: [] });
  },
  clearFilters(): void {
    recompute({ filters: emptyFilterState(), search: "", focusPath: [] });
  },
  patchConfig(patch: Partial<AppConfig>): void {
    recompute({ config: { ...state.config, ...patch } });
  },
  patchVisualization(patch: Partial<Omit<AppConfig["visualization"], "style">> & { style?: Partial<VisualizationStyle> }): void {
    const { style: stylePatch, ...rest } = patch;
    const visualization = {
      ...state.config.visualization,
      ...rest,
      style: stylePatch
        ? { ...state.config.visualization.style, ...stylePatch }
        : state.config.visualization.style,
    };
    const resetFocus = patch.groupBy !== undefined || patch.layout !== undefined;
    recompute({
      config: { ...state.config, visualization },
      focusPath: resetFocus ? [] : state.focusPath,
    });
  },
  patchStyle(patch: Partial<AppConfig["visualization"]["style"]>): void {
    recompute({
      config: {
        ...state.config,
        visualization: {
          ...state.config.visualization,
          style: { ...state.config.visualization.style, ...patch },
        },
      },
    });
  },
  resetStyle(): void {
    const defaults = defaultAppConfig();
    recompute({
      config: {
        ...state.config,
        visualization: {
          ...state.config.visualization,
          style: defaults.visualization.style,
          palette: defaults.visualization.palette,
        },
      },
    });
  },
  setTheme(theme: AppConfig["theme"]): void {
    document.documentElement.dataset.theme = theme;
    recompute({ config: { ...state.config, theme } });
  },
  select(id: string | null): void {
    if (state.selectedId === id) {
      return;
    }
    setState({ selectedId: id });
  },
  hover(id: string | null): void {
    if (state.hoveredId === id) {
      return;
    }
    setState({ hoveredId: id });
  },
  drillInto(vizId: string): void {
    setState({ focusPath: [...state.focusPath, vizId], selectedId: null });
  },
  setFocusPath(focusPath: string[]): void {
    if (focusPath.length === state.focusPath.length && focusPath.every((id, index) => id === state.focusPath[index])) {
      return;
    }
    setState({ focusPath, selectedId: null });
  },
  navigateBack(): void {
    if (state.focusPath.length === 0) {
      setState({ selectedId: null });
      return;
    }
    setState({ focusPath: state.focusPath.slice(0, -1), selectedId: null });
  },
  togglePanel(panel: "filters" | "details"): void {
    setState({ panels: { ...state.panels, [panel]: !state.panels[panel] } });
  },
  setPanel(panel: "settings" | "commandPalette", open: boolean): void {
    setState({ panels: { ...state.panels, [panel]: open } });
  },
  applyPreset(preset: SavedPreset): void {
    document.documentElement.dataset.theme = preset.theme;
    recompute({
      config: { theme: preset.theme, visualization: structuredClone(preset.visualization) },
      filters: structuredClone(preset.filters),
      focusPath: [],
    });
  },
  applyStylePreset(id: string): void {
    const preset = stylePresets.find((item) => item.id === id);
    if (!preset) {
      return;
    }
    recompute({
      config: {
        ...state.config,
        visualization: composeStylePreset(state.config.visualization, preset),
      },
      focusPath: preset.visualization?.layout !== undefined || preset.style.stacking !== undefined ? [] : state.focusPath,
    });
  },
  loadSample(): void {
    recompute({
      index: createSampleIndex(),
      handles: new Map(),
      loadError: null,
      selectedId: null,
      focusPath: [],
      scan: null,
    });
  },
  loadIndex(index: FileIndex): void {
    recompute({
      index,
      handles: new Map(),
      loadError: null,
      selectedId: null,
      focusPath: [],
      scan: null,
    });
  },
  async openFolder(): Promise<void> {
    if (!window.showDirectoryPicker) {
      setState({ loadError: "Folder picking requires Chrome or Edge with the File System Access API." });
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "read" });
      scanCancel?.();
      const job = startDirectoryScan(handle, (progress) => {
        setState({ scan: progress, scanning: progress.phase !== "complete" && progress.phase !== "cancelled" });
      });
      scanCancel = job.cancel;
      setState({ scanning: true, loadError: null, scan: null });
      const result = await job.done;
      recompute({
        index: result.index,
        handles: result.handles,
        scanning: false,
        selectedId: null,
        focusPath: [],
        loadError: null,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setState({ scanning: false });
        return;
      }
      setState({
        scanning: false,
        loadError: error instanceof Error ? error.message : "Folder scan failed",
      });
    }
  },
  cancelScan(): void {
    scanCancel?.();
    setState({ scanning: false, scan: state.scan ? { ...state.scan, phase: "cancelled" } : null });
  },
  async openJson(): Promise<void> {
    try {
      const text = await pickTextFile([
        { description: "Atlas index or workspace", accept: { "application/json": [".json"] } },
      ]);
      if (text === null) {
        return;
      }
      const parsed: unknown = JSON.parse(text);
      if (isWorkspaceFile(parsed)) {
        applyWorkspace(parsed);
        return;
      }
      const result = parseIndexJson(text);
      if (!result.ok || !result.index) {
        setState({ loadError: result.errors.join("; ") });
        return;
      }
      actions.loadIndex(result.index);
    } catch (error) {
      setState({ loadError: error instanceof Error ? error.message : "Could not open JSON" });
    }
  },
  exportJson(): void {
    if (!state.index) {
      return;
    }
    downloadText(`${state.index.root.name}.index.json`, serializeIndex(state.index));
  },
  exportCsv(): void {
    if (!state.index) {
      return;
    }
    downloadText(`${state.index.root.name}.csv`, indexToCsv(state.index), "text/csv");
  },
  exportWorkspace(): void {
    const workspace = createWorkspace({
      indexName: state.index?.root.name ?? null,
      indexGeneratedAt: state.index?.generatedAt ?? null,
      search: state.search,
      selectedId: state.selectedId,
      focusPath: state.focusPath,
      filters: state.filters,
      config: cloneConfig(state.config),
      panels: { filters: state.panels.filters, details: state.panels.details },
    });
    downloadText("atlas.workspace.json", `${JSON.stringify(workspace, null, 2)}\n`);
  },
  resetVisualization(): void {
    const defaults = defaultAppConfig();
    recompute({
      config: {
        ...state.config,
        visualization: defaults.visualization,
      },
      focusPath: [],
    });
  },
};

function applyWorkspace(workspace: WorkspaceFile): void {
  document.documentElement.dataset.theme = workspace.config.theme;
  recompute({
    search: workspace.search,
    selectedId: workspace.selectedId,
    focusPath: workspace.focusPath,
    filters: workspace.filters,
    config: workspace.config,
    panels: { ...state.panels, filters: workspace.panels.filters, details: workspace.panels.details },
  });
}

async function pickTextFile(types: Array<{ description?: string; accept: Record<string, string[]> }>): Promise<string | null> {
  if (window.showOpenFilePicker) {
    const [handle] = await window.showOpenFilePicker({ types });
    const file = await handle.getFile();
    return file.text();
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      resolve(file ? file.text() : null);
    });
    input.click();
  });
}

document.documentElement.dataset.theme = state.config.theme;

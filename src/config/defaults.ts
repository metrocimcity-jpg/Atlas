import type { FilterState } from "@/filtering/FilterEngine";
import { defaultVisualizationStyle } from "@/visualization/defaultStyle";
import type { VisualizationConfig } from "@/visualization/types";

export type ThemeId = "dark" | "light";

export interface AppConfig {
  theme: ThemeId;
  visualization: VisualizationConfig;
}

export interface SavedPreset {
  id: string;
  name: string;
  visualization: VisualizationConfig;
  filters: FilterState;
  theme: ThemeId;
}

export function defaultAppConfig(): AppConfig {
  return {
    theme: "dark",
    visualization: {
      layout: "foam",
      renderer: "foamtree",
      sizeBy: "fileSize",
      colorBy: "category",
      groupBy: ["folder"],
      customProperty: "",
      palette: "rainbow",
      showLabels: true,
      labelThreshold: 8,
      animation: true,
      style: defaultVisualizationStyle(),
    },
  };
}

export function cloneConfig(config: AppConfig): AppConfig {
  return structuredClone(config);
}

import { emptyFilterState, type FilterState } from "@/filtering/FilterEngine";
import { diskAtlasStyle, foamtreeDefaultStyle } from "@/visualization/defaultStyle";
import type { SavedPreset } from "./defaults";
import type { VisualizationConfig } from "@/visualization/types";

function viz(partial: Partial<VisualizationConfig>, filters?: Partial<FilterState>): Pick<SavedPreset, "visualization" | "filters"> {
  return {
    visualization: {
      layout: "foam",
      sizeBy: "fileSize",
      colorBy: "category",
      groupBy: ["folder"],
      customProperty: "",
      palette: "professional",
      showLabels: true,
      labelThreshold: 28,
      animation: true,
      style: foamtreeDefaultStyle(),
      ...partial,
    },
    filters: { ...emptyFilterState(), ...filters },
  };
}

export const builtinPresets: SavedPreset[] = [
  {
    id: "disk-atlas",
    name: "Disk Atlas",
    theme: "dark",
    ...viz({
      layout: "sunburst",
      colorBy: "extension",
      groupBy: ["extension"],
      palette: "rainbow",
      labelThreshold: 8,
      style: diskAtlasStyle(),
    }),
  },
  {
    id: "bim",
    name: "BIM Analysis",
    theme: "dark",
    ...viz({ colorBy: "category", groupBy: ["category", "fileType", "extension"], palette: "bim" }, { categories: ["BIM"] }),
  },
  {
    id: "cad",
    name: "CAD Analysis",
    theme: "dark",
    ...viz({ colorBy: "extension", groupBy: ["category", "extension"], palette: "cad" }, { categories: ["CAD"] }),
  },
  {
    id: "large",
    name: "Large Files",
    theme: "dark",
    ...viz({ sizeBy: "fileSize", colorBy: "fileSize", groupBy: ["size"], palette: "heatmap" }, { sizeMin: 10 * 1024 * 1024 }),
  },
  {
    id: "recent",
    name: "Recently Modified",
    theme: "dark",
    ...viz({ colorBy: "modifiedDate", groupBy: ["date"], sizeBy: "age", palette: "heatmap" }, { recentlyModifiedDays: 30 }),
  },
  {
    id: "engineering",
    name: "Engineering",
    theme: "dark",
    ...viz(
      { colorBy: "category", groupBy: ["category", "fileType"], palette: "engineering" },
      { categories: ["CAD", "BIM", "GIS", "Engineering", "3D"] },
    ),
  },
  {
    id: "archive",
    name: "Archive",
    theme: "dark",
    ...viz({ colorBy: "extension", groupBy: ["category"], palette: "monochrome" }, { categories: ["Archives"] }),
  },
];

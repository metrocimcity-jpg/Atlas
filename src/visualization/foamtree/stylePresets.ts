import { atlasLayoutFromFoam, diskAtlasStyle, foamtreeDefaultStyle } from "@/visualization/defaultStyle";
import type { LayoutMode, VisualizationConfig, VisualizationStyle } from "@/visualization/types";

export interface StylePreset {
  id: string;
  group: "Appearance" | "Color scheme" | "Borders & fill" | "Layout" | "Animation";
  label: string;
  description?: string;
  visualization?: Partial<VisualizationConfig>;
  style: Partial<VisualizationStyle>;
}

export const stylePresets: StylePreset[] = [
  {
    id: "foamtree-defaults",
    group: "Appearance",
    label: "FoamTree defaults",
    description: "Official factory look from the FoamTree settings demo",
    visualization: {
      layout: "foam",
      renderer: "foamtree",
      groupBy: ["folder"],
      colorBy: "category",
      palette: "rainbow",
      showLabels: true,
      animation: true,
    },
    style: foamtreeDefaultStyle(),
  },
  {
    id: "disk-atlas",
    group: "Appearance",
    label: "Disk Atlas",
    description: "Flattened file-type coloring used by the previous Atlas UI",
    visualization: {
      layout: "sunburst",
      renderer: "foamtree",
      groupBy: ["extension"],
      colorBy: "extension",
      palette: "rainbow",
      showLabels: true,
      animation: true,
    },
    style: diskAtlasStyle(),
  },
  {
    id: "zoomable-circle-packing",
    group: "Appearance",
    label: "Zoomable circle packing",
    description: "D3 zoomable circle packing of the current map",
    visualization: {
      layout: "circles",
      renderer: "circlePacking",
      showLabels: true,
      animation: true,
    },
    style: {
      stageBackground: "hsl(152,80%,80%)",
    },
  },
  {
    id: "sequences-sunburst",
    group: "Appearance",
    label: "Sequences Sunburst",
    description: "D3 sequences sunburst with path highlight and center percentage",
    visualization: {
      layout: "sunburst",
      renderer: "sequencesSunburst",
      showLabels: true,
      animation: true,
    },
    style: {
      stageBackground: "#ffffff",
    },
  },
  {
    id: "d3-sunburst",
    group: "Appearance",
    label: "Sunburst",
    description: "D3 sunburst with labeled arcs",
    visualization: {
      layout: "sunburst",
      renderer: "sunburst",
      showLabels: true,
      animation: true,
    },
    style: {
      stageBackground: "#ffffff",
    },
  },
  {
    id: "light-bg",
    group: "Color scheme",
    label: "For light backgrounds",    style: {
      stageBackground: "#ffffff",
      attributionTheme: "light",
      groupSelectionOutlineColor: "#222",
      groupSelectionOutlineShadowSize: 0,
      groupSelectionOutlineShadowColor: "#fff",
      groupFillGradientRadius: 1,
      groupFillGradientCenterLightnessShift: 20,
      groupFillGradientRimLightnessShift: -5,
      groupStrokeType: "plain",
      groupHoverFillLightnessShift: 20,
      groupExposureShadowColor: "rgba(0, 0, 0, 0.5)",
      groupUnexposureLightnessShift: 65,
    },
  },
  {
    id: "dark-bg",
    group: "Color scheme",
    label: "For dark backgrounds",
    style: {
      stageBackground: "#333333",
      attributionTheme: "dark",
      groupSelectionOutlineColor: "#fff",
      groupSelectionOutlineShadowSize: 2,
      groupSelectionOutlineShadowColor: "#000",
      groupFillGradientRadius: 1.2,
      groupFillGradientCenterLightnessShift: 30,
      groupFillGradientRimLightnessShift: 0,
      groupStrokeType: "gradient",
      groupHoverFillLightnessShift: 10,
      groupExposureShadowColor: "#000",
      groupUnexposureLightnessShift: -50,
    },
  },
  {
    id: "warm-colors",
    group: "Color scheme",
    label: "Warm colors",
    style: {
      colorModel: "rainbow",
      rainbowColorDistribution: "linear",
      rainbowColorDistributionAngle: 45,
      rainbowStartColor: "hsla(60, 100%, 55%, 1)",
      rainbowEndColor: "hsla(0, 100%, 60%, 1)",
    },
  },
  {
    id: "full-rainbow",
    group: "Color scheme",
    label: "Full rainbow",
    style: {
      colorModel: "rainbow",
      rainbowColorDistribution: "radial",
      rainbowColorDistributionAngle: -45,
      rainbowStartColor: "hsla(0, 100%, 55%, 1)",
      rainbowEndColor: "hsla(360, 100%, 55%, 1)",
    },
  },
  {
    id: "straight-flat",
    group: "Borders & fill",
    label: "Straight and flat",
    style: {
      groupBorderRadius: 0,
      groupFillType: "plain",
      groupStrokePlainLightnessShift: -20,
      rainbowStartColor: "hsla(0, 100%, 60%, 1)",
      rainbowEndColor: "hsla(360, 100%, 60%, 1)",
    },
  },
  {
    id: "round-gradients",
    group: "Borders & fill",
    label: "Round with gradients",
    style: {
      groupBorderRadius: 1,
      groupFillType: "gradient",
      groupFillGradientRadius: 2,
      groupFillGradientCenterLightnessShift: 30,
      groupFillGradientRimLightnessShift: -10,
    },
  },
  {
    id: "bold-borders",
    group: "Borders & fill",
    label: "Bold borders",
    style: {
      groupBorderWidth: 8,
      groupInsetWidth: 10,
      groupStrokeWidth: 2.5,
    },
  },
  {
    id: "no-borders",
    group: "Borders & fill",
    label: "No borders",
    style: {
      groupBorderRadius: 0,
      groupBorderWidth: 0,
      groupInsetWidth: 0,
      groupSelectionOutlineWidth: 5,
      groupStrokeWidth: 0,
    },
  },
  {
    id: "fisheye",
    group: "Layout",
    label: "Large groups in the center",
    visualization: { layout: "circles" },
    style: { relaxationInitializer: "fisheye", foamLayout: "relaxed" },
  },
  {
    id: "blackhole",
    group: "Layout",
    label: "Large groups in the corners",
    visualization: { layout: "foam" },
    style: { relaxationInitializer: "blackhole", foamLayout: "relaxed" },
  },
  {
    id: "ordered",
    group: "Layout",
    label: "Like in FoamTree 2.0.x",
    visualization: { layout: "foam" },
    style: { relaxationInitializer: "ordered", foamLayout: "relaxed" },
  },
  {
    id: "treemap",
    group: "Layout",
    label: "Traditional treemap",
    visualization: { layout: "treemap" },
    style: { foamLayout: "squarified" },
  },
  {
    id: "hierarchical",
    group: "Layout",
    label: "Top level initially visible",
    visualization: { layout: "foam" },
    style: {
      stacking: "hierarchical",
      groupFillGradientRadius: 1,
      groupFillGradientCenterLightnessShift: 20,
      parentFillOpacity: 0.7,
      rainbowLightnessShift: 30,
    },
  },
  {
    id: "flattened",
    group: "Layout",
    label: "All levels initially visible",
    visualization: { layout: "sunburst" },
    style: {
      stacking: "flattened",
      foamLayout: "relaxed",
      groupFillGradientRadius: 2,
      groupFillGradientCenterLightnessShift: 10,
      parentFillOpacity: 0.45,
      rainbowLightnessShift: 20,
    },
  },
  {
    id: "no-animation",
    group: "Animation",
    label: "No animation",
    visualization: { animation: false },
    style: { rolloutDuration: 0, pullbackDuration: 0, fadeDuration: 0 },
  },
  {
    id: "fade",
    group: "Animation",
    label: "Fade in, fade out",
    visualization: { animation: true },
    style: { rolloutDuration: 0, pullbackDuration: 0, fadeDuration: 700 },
  },
  {
    id: "gentle",
    group: "Animation",
    label: "Gentle scaling",
    visualization: { animation: true },
    style: {
      rolloutMethod: "groups",
      rolloutDuration: 2000,
      rolloutEasing: "squareInOut",
      rolloutScalingStrength: -0.3,
      rolloutRotationStrength: 0,
      pullbackMethod: "groups",
      pullbackDuration: 2000,
      pullbackEasing: "squareInOut",
      fadeDuration: 0,
    },
  },
  {
    id: "fly-in",
    group: "Animation",
    label: "Fly-in",
    visualization: { animation: true },
    style: {
      rolloutMethod: "individual",
      rolloutEasing: "squareOut",
      rolloutDuration: 3000,
      rolloutScalingStrength: -1,
      rolloutRotationStrength: 0,
      pullbackMethod: "individual",
      pullbackDuration: 3000,
      fadeDuration: 0,
    },
  },
  {
    id: "bouncy",
    group: "Animation",
    label: "Bouncy rotation",
    visualization: { animation: true },
    style: {
      rolloutMethod: "groups",
      rolloutEasing: "bounce",
      rolloutDuration: 4000,
      rolloutScalingStrength: -0.65,
      rolloutRotationStrength: 0.7,
      pullbackMethod: "groups",
      pullbackEasing: "bounce",
      pullbackDuration: 4000,
      fadeDuration: 0,
    },
  },
];

export function applyStylePreset(current: VisualizationConfig, preset: StylePreset): VisualizationConfig {
  const style = { ...current.style, ...preset.style };
  const visualization: VisualizationConfig = {
    ...current,
    ...preset.visualization,
    style,
  };
  visualization.layout = (preset.visualization?.layout ?? atlasLayoutFromFoam(style)) as LayoutMode;
  return visualization;
}

export const STYLE_PRESET_GROUPS: StylePreset["group"][] = [
  "Appearance",
  "Color scheme",
  "Borders & fill",
  "Layout",
  "Animation",
];

import type { VisualizationStyle } from "@/visualization/types";

export type SettingControl =
  | {
      option: keyof VisualizationStyle | "showLabels" | "animation";
      label: string;
      type: "number";
      min: number;
      max: number;
      step: number;
    }
  | {
      option: keyof VisualizationStyle | "showLabels" | "animation";
      label: string;
      type: "boolean";
    }
  | {
      option: keyof VisualizationStyle | "showLabels" | "animation";
      label: string;
      type: "enum";
      values: Array<{ value: string; label?: string }>;
    }
  | {
      option: keyof VisualizationStyle | "showLabels" | "animation";
      label: string;
      type: "color" | "string";
    };

export interface SettingGroup {
  id: string;
  label: string;
  options: SettingControl[];
}

export const settingGroups: SettingGroup[] = [
  {
    id: "layout",
    label: "Layout",
    options: [
      {
        option: "foamLayout",
        label: "Layout",
        type: "enum",
        values: [{ value: "relaxed" }, { value: "ordered" }, { value: "squarified" }],
      },
      { option: "layoutByWeightOrder", label: "Layout in the order of weights", type: "boolean" },
      { option: "groupMinDiameter", label: "Minimum group diameter", type: "number", min: 0, max: 200, step: 1 },
    ],
  },
  {
    id: "relaxation",
    label: "Relaxation",
    options: [
      {
        option: "relaxationInitializer",
        label: "Relaxation initializer",
        type: "enum",
        values: [
          { value: "fisheye" },
          { value: "ordered" },
          { value: "squarified" },
          { value: "blackhole" },
          { value: "random" },
        ],
      },
      { option: "relaxationQualityThreshold", label: "Relaxation quality threshold", type: "number", min: 0, max: 4, step: 0.01 },
      { option: "relaxationVisible", label: "Show relaxation", type: "boolean" },
    ],
  },
  {
    id: "stacking",
    label: "Stacking",
    options: [
      {
        option: "stacking",
        label: "Stacking order",
        type: "enum",
        values: [{ value: "hierarchical" }, { value: "flattened" }],
      },
      {
        option: "descriptionGroup",
        label: "Description group",
        type: "enum",
        values: [{ value: "auto" }, { value: "always" }],
      },
      {
        option: "descriptionGroupType",
        label: "Description group type",
        type: "enum",
        values: [{ value: "stab" }, { value: "floating" }],
      },
      { option: "descriptionGroupSize", label: "Description group size", type: "number", min: 0, max: 1, step: 0.01 },
      { option: "descriptionGroupMaxHeight", label: "Description max height", type: "number", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "groupBorders",
    label: "Group borders",
    options: [
      { option: "groupBorderRadius", label: "Group border radius", type: "number", min: 0, max: 1, step: 0.01 },
      { option: "groupBorderWidth", label: "Group border width", type: "number", min: 0, max: 50, step: 0.1 },
      { option: "groupInsetWidth", label: "Group inset width", type: "number", min: 0, max: 50, step: 0.1 },
      { option: "groupBorderWidthScaling", label: "Group border width scaling", type: "number", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "groupFill",
    label: "Group fill",
    options: [
      {
        option: "groupFillType",
        label: "Group fill type",
        type: "enum",
        values: [{ value: "none" }, { value: "plain" }, { value: "gradient" }],
      },
      { option: "groupFillGradientRadius", label: "Gradient radius", type: "number", min: 0, max: 5, step: 0.01 },
      { option: "groupFillGradientCenterLightnessShift", label: "Gradient center lightness shift", type: "number", min: -100, max: 100, step: 1 },
      { option: "groupFillGradientRimLightnessShift", label: "Gradient rim lightness shift", type: "number", min: -100, max: 100, step: 1 },
    ],
  },
  {
    id: "groupStroke",
    label: "Group stroke",
    options: [
      {
        option: "groupStrokeType",
        label: "Group stroke type",
        type: "enum",
        values: [{ value: "none" }, { value: "plain" }, { value: "gradient" }],
      },
      { option: "groupStrokeWidth", label: "Group stroke width", type: "number", min: 0, max: 20, step: 0.1 },
      { option: "groupStrokePlainLightnessShift", label: "Plain lightness shift", type: "number", min: -100, max: 100, step: 1 },
    ],
  },
  {
    id: "selection",
    label: "Group selection",
    options: [
      { option: "groupSelectionOutlineColor", label: "Selection outline color", type: "string" },
      { option: "groupSelectionOutlineWidth", label: "Selection outline width", type: "number", min: 0, max: 20, step: 0.5 },
      { option: "groupSelectionOutlineShadowSize", label: "Selection outline shadow size", type: "number", min: 0, max: 20, step: 0.5 },
    ],
  },
  {
    id: "rainbow",
    label: "Rainbow colors",
    options: [
      {
        option: "colorModel",
        label: "Color model",
        type: "enum",
        values: [
          { value: "rainbow", label: "FoamTree rainbow" },
          { value: "prisma", label: "File type / Prisma" },
        ],
      },
      { option: "rainbowStartColor", label: "Rainbow start color", type: "string" },
      { option: "rainbowEndColor", label: "Rainbow end color", type: "string" },
      {
        option: "rainbowColorDistribution",
        label: "Color distribution",
        type: "enum",
        values: [{ value: "radial" }, { value: "linear" }],
      },
      { option: "rainbowColorDistributionAngle", label: "Color distribution angle", type: "number", min: -180, max: 180, step: 1 },
      { option: "rainbowLightnessShift", label: "Lightness shift", type: "number", min: -100, max: 100, step: 1 },
      { option: "rainbowSaturationCorrection", label: "Saturation correction", type: "number", min: -1, max: 1, step: 0.05 },
      { option: "rainbowLightnessCorrection", label: "Lightness correction", type: "number", min: -1, max: 1, step: 0.05 },
    ],
  },
  {
    id: "labels",
    label: "Labels",
    options: [
      { option: "showLabels", label: "Show labels", type: "boolean" },
      { option: "groupLabelFontFamily", label: "Font family", type: "string" },
      {
        option: "groupLabelFontWeight",
        label: "Font weight",
        type: "enum",
        values: [{ value: "normal" }, { value: "600" }, { value: "bold" }],
      },
      { option: "groupLabelMinFontSize", label: "Minimum font size", type: "number", min: 0, max: 40, step: 1 },
      { option: "groupLabelMaxFontSize", label: "Maximum font size", type: "number", min: 8, max: 200, step: 1 },
      { option: "maxGroupLabelLevelsDrawn", label: "Max label levels drawn", type: "number", min: 0, max: 12, step: 1 },
      { option: "maxGroupLevelsDrawn", label: "Max group levels drawn", type: "number", min: 1, max: 12, step: 1 },
      { option: "parentFillOpacity", label: "Parent fill opacity", type: "number", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "animation",
    label: "Animation",
    options: [
      { option: "animation", label: "Enable animation", type: "boolean" },
      { option: "rolloutDuration", label: "Rollout duration", type: "number", min: 0, max: 6000, step: 50 },
      { option: "pullbackDuration", label: "Pullback duration", type: "number", min: 0, max: 6000, step: 50 },
      { option: "fadeDuration", label: "Fade duration", type: "number", min: 0, max: 2000, step: 50 },
      {
        option: "rolloutEasing",
        label: "Rollout easing",
        type: "enum",
        values: [
          { value: "linear" },
          { value: "squareOut" },
          { value: "squareIn" },
          { value: "squareInOut" },
          { value: "bounce" },
          { value: "cubicInOut" },
        ],
      },
      {
        option: "rolloutMethod",
        label: "Rollout method",
        type: "enum",
        values: [{ value: "groups" }, { value: "individual" }],
      },
    ],
  },
];

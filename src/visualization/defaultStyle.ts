import type { LayoutMode, VisualizationStyle } from "@/visualization/types";

/** Official FoamTree factory defaults (settings.html), plus Oxygen from the demo. */
export function foamtreeDefaultStyle(): VisualizationStyle {
  return {
    colorModel: "rainbow",
    stageBackground: "#ffffff",
    foamLayout: "relaxed",
    stacking: "hierarchical",
    layoutByWeightOrder: true,
    groupMinDiameter: 10,
    relaxationInitializer: "fisheye",
    relaxationQualityThreshold: 1,
    relaxationVisible: false,
    descriptionGroup: "auto",
    descriptionGroupType: "stab",
    descriptionGroupSize: 0.125,
    descriptionGroupMaxHeight: 0.5,
    groupBorderRadius: 0.15,
    groupBorderWidth: 4,
    groupInsetWidth: 6,
    groupBorderWidthScaling: 0.6,
    groupFillType: "gradient",
    groupFillGradientRadius: 1,
    groupFillGradientCenterLightnessShift: 20,
    groupFillGradientRimLightnessShift: -5,
    groupStrokeType: "plain",
    groupStrokeWidth: 1.5,
    groupStrokePlainLightnessShift: -10,
    groupSelectionOutlineWidth: 5,
    groupSelectionOutlineColor: "#222",
    groupSelectionOutlineShadowSize: 0,
    groupSelectionOutlineShadowColor: "#fff",
    groupHoverFillLightnessShift: 20,
    groupLabelFontFamily: "Oxygen, sans-serif",
    groupLabelFontWeight: "normal",
    groupLabelMinFontSize: 6,
    groupLabelMaxFontSize: 160,
    groupLabelVerticalPadding: 1,
    groupLabelHorizontalPadding: 1,
    groupLabelLineHeight: 1.05,
    maxGroupLevelsDrawn: 4,
    maxGroupLabelLevelsDrawn: 3,
    parentFillOpacity: 0.7,
    parentLabelOpacity: 1,
    rainbowStartColor: "hsla(0, 100%, 55%, 1)",
    rainbowEndColor: "hsla(359, 100%, 55%, 1)",
    rainbowColorDistribution: "radial",
    rainbowColorDistributionAngle: -45,
    rainbowLightnessShift: 30,
    rainbowSaturationCorrection: 0.1,
    rainbowLightnessCorrection: 0.4,
    rolloutDuration: 2000,
    pullbackDuration: 1500,
    fadeDuration: 700,
    rolloutEasing: "squareOut",
    rolloutMethod: "groups",
    pullbackEasing: "squareIn",
    pullbackMethod: "groups",
    rolloutScalingStrength: -0.7,
    rolloutRotationStrength: -0.7,
    zoomMouseWheelFactor: 1.5,
    attributionTheme: "light",
    groupUnexposureLightnessShift: 65,
    groupExposureShadowColor: "rgba(0, 0, 0, 0.5)",
  };
}

/** Previous Disk Atlas chrome + flattened file-type coloring. */
export function diskAtlasStyle(): VisualizationStyle {
  return {
    ...foamtreeDefaultStyle(),
    colorModel: "atlas",
    stageBackground: "#0f1115",
    foamLayout: "relaxed",
    stacking: "flattened",
    groupMinDiameter: 0,
    relaxationInitializer: "ordered",
    relaxationQualityThreshold: 0.5,
    relaxationVisible: true,
    descriptionGroup: "always",
    descriptionGroupType: "stab",
    descriptionGroupSize: 0.01,
    descriptionGroupMaxHeight: 0.1,
    groupBorderRadius: 0.15,
    groupBorderWidth: 1.2,
    groupInsetWidth: 2,
    groupBorderWidthScaling: 1,
    groupFillType: "plain",
    groupStrokeType: "plain",
    groupStrokeWidth: 1.2,
    groupSelectionOutlineWidth: 2,
    groupSelectionOutlineColor: "#ffb454",
    groupHoverFillLightnessShift: 10,
    groupLabelFontFamily: "'Inter', sans-serif",
    groupLabelFontWeight: "600",
    groupLabelMinFontSize: 0,
    groupLabelMaxFontSize: 160,
    groupLabelVerticalPadding: 0.2,
    groupLabelHorizontalPadding: 1.05,
    groupLabelLineHeight: 1.12,
    maxGroupLevelsDrawn: 8,
    maxGroupLabelLevelsDrawn: 8,
    parentFillOpacity: 1,
    rolloutDuration: 300,
    pullbackDuration: 300,
    fadeDuration: 180,
    zoomMouseWheelFactor: 1.12,
    attributionTheme: "dark",
    groupUnexposureLightnessShift: -50,
    groupExposureShadowColor: "#000",
  };
}

export const defaultVisualizationStyle = foamtreeDefaultStyle;

export function atlasLayoutFromFoam(style: Pick<VisualizationStyle, "foamLayout" | "stacking" | "relaxationInitializer">): LayoutMode {
  if (style.foamLayout === "squarified") {
    return "treemap";
  }
  if (style.stacking === "flattened") {
    return "sunburst";
  }
  if (style.relaxationInitializer === "fisheye") {
    return "circles";
  }
  return "foam";
}

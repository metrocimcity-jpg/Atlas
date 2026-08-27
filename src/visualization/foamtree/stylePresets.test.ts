import { describe, expect, it } from "vitest";
import { applyStylePreset, stylePresets } from "./stylePresets";
import { defaultAppConfig } from "@/config/defaults";
import { diskAtlasStyle, foamtreeDefaultStyle } from "@/visualization/defaultStyle";

describe("FoamTree style presets", () => {
  it("defaults to official FoamTree factory styling", () => {
    const config = defaultAppConfig().visualization;
    expect(config.style.colorModel).toBe("rainbow");
    expect(config.style.foamLayout).toBe("relaxed");
    expect(config.style.stacking).toBe("hierarchical");
    expect(config.style.groupFillType).toBe("gradient");
    expect(config.style.groupLabelFontFamily).toContain("Oxygen");
    expect(config.layout).toBe("foam");
  });

  it("keeps Disk Atlas as a color and style preset", () => {
    const atlas = stylePresets.find((preset) => preset.id === "disk-atlas");
    expect(atlas).toBeDefined();
    const applied = applyStylePreset(defaultAppConfig().visualization, atlas!);
    expect(applied.style.colorModel).toBe("atlas");
    expect(applied.style.stacking).toBe("flattened");
    expect(applied.groupBy).toEqual(["extension"]);
    expect(applied.style.groupLabelFontFamily).toBe(diskAtlasStyle().groupLabelFontFamily);
    expect(foamtreeDefaultStyle().colorModel).toBe("rainbow");
  });
});

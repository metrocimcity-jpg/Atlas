import { describe, expect, it } from "vitest";
import { applyStylePreset, stylePresets } from "./stylePresets";
import { defaultAppConfig } from "@/config/defaults";
import { diskPrismaStyle, foamtreeDefaultStyle } from "@/visualization/defaultStyle";

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

  it("keeps Disk Prisma as a color and style preset", () => {
    const prisma = stylePresets.find((preset) => preset.id === "disk-prisma");
    expect(prisma).toBeDefined();
    const applied = applyStylePreset(defaultAppConfig().visualization, prisma!);
    expect(applied.style.colorModel).toBe("prisma");
    expect(applied.style.stacking).toBe("flattened");
    expect(applied.groupBy).toEqual(["extension"]);
    expect(applied.renderer).toBe("foamtree");
    expect(applied.style.groupLabelFontFamily).toBe(diskPrismaStyle().groupLabelFontFamily);
    expect(foamtreeDefaultStyle().colorModel).toBe("rainbow");
  });

  it("switches to D3 appearance presets via renderer", () => {
    const packing = stylePresets.find((preset) => preset.id === "zoomable-circle-packing");
    expect(packing).toBeDefined();
    const applied = applyStylePreset(defaultAppConfig().visualization, packing!);
    expect(applied.renderer).toBe("circlePacking");
  });
});
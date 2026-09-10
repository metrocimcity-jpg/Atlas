import { describe, expect, it } from "vitest";
import { formatAccLabel, inferAccTaxonomy, isAccAcceleratorNamed, mergeAccTaxonomyMetadata } from "@/metadata/accTaxonomy";

describe("formatAccLabel", () => {
  it("formats as code plus bracket short name", () => {
    expect(formatAccLabel("FEC A (Reserved)", "F0326")).toBe("F0326 [FECA]");
    expect(formatAccLabel("F0326 — FEC A (Reserved)")).toBe("F0326 [FECA]");
    expect(formatAccLabel("FEC E  (Reserved)", "F0330")).toBe("F0330 [FECE]");
  });

  it("formats other categories the same way", () => {
    expect(formatAccLabel("Drawing", "DRG")).toBe("DRG [Drawing]");
    expect(formatAccLabel("Aeronautical Communication System", "ACS0")).toBe(
      "ACS0 [AeronauticalCommunicationSystem]",
    );
  });
});

describe("inferAccTaxonomy", () => {
  it("decodes Accelerator positional filename tokens with code [name] labels", () => {
    const result = inferAccTaxonomy("L-AC-AE-GT-AAP08-ACS0-DRG-14221.pdf", "BIM/L-AC-AE-GT-AAP08-ACS0-DRG-14221.pdf");
    expect(result["ACC-Portfolio"]).toMatch(/^L \[/);
    expect(result["ACC-Program"]).toMatch(/^AC \[/);
    expect(result["ACC-Document Type"]).toBe("DRG [Drawing]");
  });

  it("maps reserved locations to F0326 [FECA]", () => {
    const result = inferAccTaxonomy("L-AC-AE-GT-F0326-ACS0-DRG-1.pdf", "docs/L-AC-AE-GT-F0326-ACS0-DRG-1.pdf");
    expect(result["ACC-Location"]).toBe("F0326 [FECA]");
  });

  it("maps L7 document type codes from loose tokens only for Accelerator names", () => {
    const accelerator = inferAccTaxonomy("L-AC-AE-GT-AAP08-ACS0-DRG-Sheet.pdf", "Docs/L-AC-AE-GT-AAP08-ACS0-DRG-Sheet.pdf");
    expect(accelerator["ACC-Document Type"]).toBe("DRG [Drawing]");
  });

  it("only merges taxonomy metadata for ACC / Accelerator files", () => {
    expect(isAccAcceleratorNamed("L-AC-AE-GT-F0326-ACS0-DRG-1.pdf")).toBe(true);
    expect(isAccAcceleratorNamed("Harbor-Bridge-DRG-Sheet.pdf")).toBe(false);
    expect(mergeAccTaxonomyMetadata(undefined, "Harbor-Bridge-DRG-Sheet.pdf", "Docs/x.pdf")).toBeUndefined();
    const merged = mergeAccTaxonomyMetadata(undefined, "L-AC-AE-GT-F0326-ACS0-DRG-1.pdf", "docs/L-AC-AE-GT-F0326-ACS0-DRG-1.pdf");
    expect(merged?.["ACC-Location"]).toBe("F0326 [FECA]");
  });
});

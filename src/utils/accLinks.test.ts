import { describe, expect, it } from "vitest";
import { accUrlFromMetadata, describeAccLinkError, isAccWebUrl, looksLikeFilePath, normalizeAccWebUrl } from "@/utils/accLinks";

describe("accLinks", () => {
  const sample =
    "https://acc.autodesk.com/docs/files/projects/e976d832-93f7-44d3-9051-625bf228d216?folderUrn=urn%3Aadsk.wipprod%3Afs.folder%3Aco.j0erY7apSNGl6hJHUTHhOQ&entityId=urn%3Aadsk.wipprod%3Adm.lineage%3AmgJecIvQQ2OfqTbZSH8zxg";

  it("accepts ACC Docs URLs", () => {
    expect(isAccWebUrl(sample)).toBe(true);
    expect(normalizeAccWebUrl(`  ${sample}  `)).toBe(sample);
  });

  it("rejects non-ACC URLs", () => {
    expect(isAccWebUrl("https://example.com/file.rvt")).toBe(false);
    expect(normalizeAccWebUrl("not-a-url")).toBeNull();
  });

  it("detects file paths vs ACC links", () => {
    const path = "ELE/PDF/2026-04-10 FECA Issued for Schematic Design/L-AC-AE-PD-F0326-ELE3-DRG-14221.pdf";
    expect(looksLikeFilePath(path)).toBe(true);
    expect(describeAccLinkError(path)).toContain("file path");
    expect(looksLikeFilePath(sample)).toBe(false);
  });

  it("reads accUrl from metadata aliases", () => {
    expect(accUrlFromMetadata({ accUrl: sample })).toBe(sample);
    expect(accUrlFromMetadata({ webUrl: sample })).toBe(sample);
    expect(accUrlFromMetadata({ title: "FEC A" })).toBeNull();
  });
});

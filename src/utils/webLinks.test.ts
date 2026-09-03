import { describe, expect, it } from "vitest";
import { openableWebUrlFromMetadata } from "@/utils/webLinks";

describe("webLinks", () => {
  const acc =
    "https://acc.autodesk.com/docs/files/projects/e976d832-93f7-44d3-9051-625bf228d216?entityId=urn:adsk.wipprod:dm.lineage:abc";
  const sharePoint = "https://pactgp.sharepoint.com/sites/PACTDesign/Collaboration/plan.pdf";

  it("prefers ACC Docs URLs", () => {
    expect(openableWebUrlFromMetadata({ accUrl: acc, webUrl: sharePoint })).toBe(acc);
  });

  it("returns SharePoint webUrl when present", () => {
    expect(openableWebUrlFromMetadata({ webUrl: sharePoint })).toBe(sharePoint);
    expect(openableWebUrlFromMetadata({ sharePointUrl: sharePoint })).toBe(sharePoint);
  });

  it("ignores non-cloud metadata", () => {
    expect(openableWebUrlFromMetadata({ webUrl: "https://example.com/file.pdf" })).toBeNull();
    expect(openableWebUrlFromMetadata({ title: "x" })).toBeNull();
  });
});

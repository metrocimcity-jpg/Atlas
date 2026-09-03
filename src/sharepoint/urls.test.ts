import { describe, expect, it } from "vitest";
import { isSharePointWebUrl, parseSharePointLibraryUrl } from "@/sharepoint/urls";

describe("parseSharePointLibraryUrl", () => {
  it("parses a PACT Collaboration library URL", () => {
    const parsed = parseSharePointLibraryUrl(
      "https://pactgp.sharepoint.com/sites/PACTDesign/Collaboration/Forms/AllItems.aspx",
    );
    expect(parsed).toEqual({
      hostname: "pactgp.sharepoint.com",
      sitePath: "sites/PACTDesign",
      libraryName: "Collaboration",
      folderPath: null,
    });
  });

  it("parses a library URL with a folder path", () => {
    const parsed = parseSharePointLibraryUrl(
      "https://contoso.sharepoint.com/sites/Design/Shared%20Documents/AE/Forms/AllItems.aspx",
    );
    expect(parsed).toEqual({
      hostname: "contoso.sharepoint.com",
      sitePath: "sites/Design",
      libraryName: "Shared Documents",
      folderPath: "AE",
    });
  });

  it("rejects non-SharePoint URLs", () => {
    expect(parseSharePointLibraryUrl("https://example.com/sites/x")).toBeNull();
    expect(isSharePointWebUrl("https://pactgp.sharepoint.com/sites/PACTDesign")).toBe(true);
    expect(isSharePointWebUrl("https://acc.autodesk.com/docs")).toBe(false);
  });
});

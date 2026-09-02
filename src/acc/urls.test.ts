import { describe, expect, it } from "vitest";
import { buildAccDocsUrl, parseAccProjectIdFromUrl, stripProjectIdPrefix, withProjectIdPrefix } from "@/acc/urls";

describe("acc urls", () => {
  it("builds Docs deep links", () => {
    const url = buildAccDocsUrl({
      projectId: "b.e976d832-93f7-44d3-9051-625bf228d216",
      entityId: "urn:adsk.wipprod:dm.lineage:mgJecIvQQ2OfqTbZSH8zxg",
      folderUrn: "urn:adsk.wipprod:fs.folder:co.j0erY7apSNGl6hJHUTHhOQ",
    });
    expect(url).toContain("https://acc.autodesk.com/docs/files/projects/e976d832-93f7-44d3-9051-625bf228d216");
    expect(url).toContain("entityId=");
    expect(url).toContain("folderUrn=");
  });

  it("parses project id from ACC URL", () => {
    expect(
      parseAccProjectIdFromUrl(
        "https://acc.autodesk.com/docs/files/projects/e976d832-93f7-44d3-9051-625bf228d216?entityId=urn:x",
      ),
    ).toBe("e976d832-93f7-44d3-9051-625bf228d216");
  });

  it("normalizes b. prefix", () => {
    expect(stripProjectIdPrefix("b.abc")).toBe("abc");
    expect(withProjectIdPrefix("abc")).toBe("b.abc");
  });
});

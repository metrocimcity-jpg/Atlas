import { describe, expect, it } from "vitest";
import { directoryHandleKey, localOpenPathCandidates } from "@/scanner/localFolderLink";

describe("local folder link", () => {
  it("uses the relative path stored in an exported index", () => {
    expect(
      localOpenPathCandidates(
        { id: "BIM/Harbor.rvt", relativePath: "BIM/Harbor.rvt", name: "Harbor.rvt" },
        "AE",
      ),
    ).toEqual(["BIM/Harbor.rvt"]);
  });

  it("drops a leading root-folder prefix when the JSON path includes it", () => {
    expect(
      localOpenPathCandidates(
        { id: "AE/BIM/Harbor.rvt", relativePath: "AE/BIM/Harbor.rvt", name: "Harbor.rvt" },
        "AE",
      ),
    ).toEqual(["AE/BIM/Harbor.rvt", "BIM/Harbor.rvt"]);
  });

  it("keys stored folder permission by the exported index", () => {
    expect(directoryHandleKey({ root: { name: "AE" }, generatedAt: "2026-09-27T00:00:00.000Z" })).toBe(
      "AE\u00002026-09-27T00:00:00.000Z",
    );
  });
});

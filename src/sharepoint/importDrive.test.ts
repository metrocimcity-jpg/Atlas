import { describe, expect, it } from "vitest";
import { driveItemsToFileIndex } from "@/sharepoint/importDrive";
import type { GraphDriveItem } from "@/sharepoint/graph";

describe("driveItemsToFileIndex", () => {
  it("maps Graph drive items into a Prisma FileIndex with webUrl metadata", () => {
    const items: GraphDriveItem[] = [
      {
        id: "folder-1",
        name: "AE - Airfield",
        folder: { childCount: 1 },
        webUrl: "https://pactgp.sharepoint.com/sites/PACTDesign/Collaboration/AE%20-%20Airfield",
        parentReference: { path: "/drives/drive-1/root:" },
      },
      {
        id: "file-1",
        name: "plan.pdf",
        size: 1200,
        file: { mimeType: "application/pdf" },
        webUrl: "https://pactgp.sharepoint.com/sites/PACTDesign/Collaboration/AE%20-%20Airfield/plan.pdf",
        lastModifiedDateTime: "2026-01-02T00:00:00Z",
        parentReference: { path: "/drives/drive-1/root:/AE - Airfield" },
      },
    ];

    const index = driveItemsToFileIndex(items, {
      rootName: "Collaboration",
      rootPath: "https://pactgp.sharepoint.com/sites/PACTDesign/Collaboration",
      driveName: "Collaboration",
    });

    expect(index.root.name).toBe("Collaboration");
    expect(index.statistics.totalFiles).toBe(1);
    expect(index.statistics.totalFolders).toBe(1);

    const file = index.items.find((item) => item.name === "plan.pdf");
    expect(file?.relativePath).toBe("AE - Airfield/plan.pdf");
    expect(file?.metadata?.webUrl).toContain("plan.pdf");
    expect(file?.metadata?.source).toBe("sharepoint");
    expect(file?.category).toBe("PDF");
  });
});

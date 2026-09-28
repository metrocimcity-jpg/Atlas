import { accUrlFromMetadata, isAccWebUrl, openAccWebUrl } from "@/utils/accLinks";
import { isSharePointWebUrl, normalizeSharePointWebUrl } from "@/sharepoint/urls";

const WEB_URL_KEYS = ["accUrl", "webUrl", "accWebUrl", "docsUrl", "autodeskUrl", "sharePointUrl"] as const;

/** Prefer ACC Docs URLs, then any SharePoint https link from metadata. */
export function openableWebUrlFromMetadata(metadata: Record<string, unknown> | undefined): string | null {
  const acc = accUrlFromMetadata(metadata);
  if (acc) {
    return acc;
  }
  if (!metadata) {
    return null;
  }
  for (const key of WEB_URL_KEYS) {
    const value = metadata[key];
    if (typeof value !== "string") {
      continue;
    }
    const sharePoint = normalizeSharePointWebUrl(value);
    if (sharePoint) {
      return sharePoint;
    }
  }
  return null;
}

export function openWebUrl(url: string): void {
  const trimmed = url.trim();
  if (isAccWebUrl(trimmed)) {
    openAccWebUrl(trimmed);
    return;
  }
  const sharePoint = normalizeSharePointWebUrl(trimmed);
  if (!sharePoint) {
    throw new Error("Not a supported ACC or SharePoint https link.");
  }
  const opened = window.open(sharePoint, "_blank", "noopener,noreferrer");
  if (!opened) {
    throw new Error("Popup blocked — allow popups for Prisma to open SharePoint.");
  }
}

export function isOpenableCloudUrl(value: string): boolean {
  return isAccWebUrl(value) || isSharePointWebUrl(value);
}

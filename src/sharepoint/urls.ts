export interface ParsedSharePointLibraryUrl {
  hostname: string;
  /** Site server-relative path without leading slash, e.g. sites/PACTDesign */
  sitePath: string;
  /** Document library segment if present, e.g. Collaboration */
  libraryName: string | null;
  /** Remaining folder path under the library, if any */
  folderPath: string | null;
}

/**
 * Parse common SharePoint Online library URLs, e.g.
 * https://pactgp.sharepoint.com/sites/PACTDesign/Collaboration/Forms/AllItems.aspx
 * https://pactgp.sharepoint.com/sites/PACTDesign/Shared%20Documents/Forms/AllItems.aspx
 */
export function parseSharePointLibraryUrl(raw: string): ParsedSharePointLibraryUrl | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") {
    return null;
  }
  if (!url.hostname.toLowerCase().endsWith(".sharepoint.com")) {
    return null;
  }

  const segments = url.pathname
    .split("/")
    .map((part) => decodeURIComponent(part))
    .filter((part) => part.length > 0);

  if (segments.length === 0) {
    return null;
  }

  let sitePath: string;
  let rest: string[];

  if (segments[0]?.toLowerCase() === "sites" || segments[0]?.toLowerCase() === "teams") {
    if (segments.length < 2) {
      return null;
    }
    sitePath = `${segments[0]}/${segments[1]}`;
    rest = segments.slice(2);
  } else {
    // Root site collection — treat first segment as library when present.
    sitePath = "";
    rest = segments;
  }

  // Drop Forms/AllItems.aspx and similar view paths.
  const formsIndex = rest.findIndex((segment) => segment.toLowerCase() === "forms");
  if (formsIndex >= 0) {
    rest = rest.slice(0, formsIndex);
  }

  const libraryName = rest[0] ?? null;
  const folderParts = rest.slice(1);
  const folderPath = folderParts.length > 0 ? folderParts.join("/") : null;

  return {
    hostname: url.hostname.toLowerCase(),
    sitePath,
    libraryName,
    folderPath,
  };
}

export function isSharePointWebUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") {
      return false;
    }
    return url.hostname.toLowerCase().endsWith(".sharepoint.com");
  } catch {
    return false;
  }
}

export function normalizeSharePointWebUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!isSharePointWebUrl(trimmed)) {
    return null;
  }
  return trimmed;
}

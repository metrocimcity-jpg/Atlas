const ACC_HOSTS = new Set(["acc.autodesk.com", "docs.b360.autodesk.com", "docs.autodesk.com"]);

const ACC_URL_KEYS = ["accUrl", "webUrl", "accWebUrl", "docsUrl", "autodeskUrl"] as const;

export function looksLikeFilePath(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return false;
  }
  return (
    /[\\/]/.test(trimmed) ||
    /\.[a-z0-9]{2,5}$/i.test(trimmed) ||
    /^[a-z]:\\/i.test(trimmed) ||
    trimmed.startsWith("\\\\")
  );
}

export function isAccWebUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") {
      return false;
    }
    if (ACC_HOSTS.has(url.hostname)) {
      return true;
    }
    return url.hostname.endsWith(".autodesk.com") && (url.pathname.includes("/docs/") || url.search.includes("entityId="));
  } catch {
    return false;
  }
}

export function normalizeAccWebUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!isAccWebUrl(trimmed)) {
    return null;
  }
  return trimmed;
}

export function describeAccLinkError(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "Paste an ACC Docs https link first.";
  }
  if (looksLikeFilePath(trimmed)) {
    return "That is a file path, not an ACC web link. In File Explorer: right-click the file → Desktop Connector → Copy web link (must start with https://acc.autodesk.com/...). Atlas Copy path will not open ACC.";
  }
  if (/^http:\/\//i.test(trimmed)) {
    return "Use an https:// ACC Docs link, not http.";
  }
  return "Paste a full ACC Docs link like https://acc.autodesk.com/docs/files/projects/...?entityId=...";
}

export function accUrlFromMetadata(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata) {
    return null;
  }
  for (const key of ACC_URL_KEYS) {
    const value = metadata[key];
    if (typeof value === "string") {
      const normalized = normalizeAccWebUrl(value);
      if (normalized) {
        return normalized;
      }
    }
  }
  return null;
}

export function openAccWebUrl(url: string): void {
  const normalized = normalizeAccWebUrl(url);
  if (!normalized) {
    throw new Error(describeAccLinkError(url));
  }
  const opened = window.open(normalized, "_blank", "noopener,noreferrer");
  if (!opened) {
    throw new Error("Popup blocked — allow popups for Atlas to open ACC.");
  }
}

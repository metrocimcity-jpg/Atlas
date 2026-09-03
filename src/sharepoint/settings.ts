const STORAGE_KEY = "atlas.ms.settings.v1";

export interface SharePointSettings {
  /** Azure AD SPA application (client) ID */
  clientId: string;
}

export function loadSharePointSettings(): SharePointSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { clientId: "" };
    }
    const parsed = JSON.parse(raw) as Partial<SharePointSettings>;
    return {
      clientId: typeof parsed.clientId === "string" ? parsed.clientId.trim() : "",
    };
  } catch {
    return { clientId: "" };
  }
}

export function saveSharePointSettings(settings: SharePointSettings): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      clientId: settings.clientId.trim(),
    }),
  );
}

import { parseAccProjectIdFromUrl, stripProjectIdPrefix } from "@/acc/urls";

const STORAGE_KEY = "atlas.acc.settings.v1";

export interface AccSettings {
  clientId: string;
  /** ACC project GUID without `b.` prefix */
  projectId: string;
}

export function loadAccSettings(): AccSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { clientId: "", projectId: "" };
    }
    const parsed = JSON.parse(raw) as Partial<AccSettings>;
    return {
      clientId: typeof parsed.clientId === "string" ? parsed.clientId.trim() : "",
      projectId: typeof parsed.projectId === "string" ? stripProjectIdPrefix(parsed.projectId) : "",
    };
  } catch {
    return { clientId: "", projectId: "" };
  }
}

export function saveAccSettings(settings: AccSettings): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      clientId: settings.clientId.trim(),
      projectId: stripProjectIdPrefix(settings.projectId),
    }),
  );
}

export function applyAccProjectFromUrl(url: string, current: AccSettings): AccSettings {
  const projectId = parseAccProjectIdFromUrl(url);
  if (!projectId) {
    return current;
  }
  return { ...current, projectId };
}

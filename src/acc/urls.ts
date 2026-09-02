/** Build Autodesk Docs deep links for opening files in ACC web. */

export function stripProjectIdPrefix(projectId: string): string {
  const trimmed = projectId.trim();
  return trimmed.startsWith("b.") ? trimmed.slice(2) : trimmed;
}

export function withProjectIdPrefix(projectId: string): string {
  const stripped = stripProjectIdPrefix(projectId);
  return stripped.startsWith("b.") ? stripped : `b.${stripped}`;
}

/**
 * ACC Docs file URL used by the web app / Desktop Connector "Copy web link".
 * projectId is the ACC project GUID without the Data Management `b.` prefix.
 */
export function buildAccDocsUrl(options: {
  projectId: string;
  entityId: string;
  folderUrn?: string | null;
}): string {
  const projectId = stripProjectIdPrefix(options.projectId);
  const entityId = options.entityId.trim();
  if (!projectId || !entityId) {
    throw new Error("ACC projectId and entityId are required to build a Docs URL.");
  }
  const url = new URL(`https://acc.autodesk.com/docs/files/projects/${projectId}`);
  if (options.folderUrn) {
    url.searchParams.set("folderUrn", options.folderUrn);
  }
  url.searchParams.set("entityId", entityId);
  url.searchParams.set("viewModel", "detail");
  url.searchParams.set("moduleId", "folders");
  return url.toString();
}

/** Extract ACC project GUID from a Docs URL (with or without b. prefix). */
export function parseAccProjectIdFromUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!url.hostname.includes("autodesk.com")) {
      return null;
    }
    const match = /\/projects\/([0-9a-fA-F-]{36})/.exec(url.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

import { requireSharePointAccessToken } from "@/sharepoint/auth";
import { parseSharePointLibraryUrl } from "@/sharepoint/urls";

const GRAPH = "https://graph.microsoft.com/v1.0";

export interface GraphSite {
  id: string;
  name: string;
  displayName: string;
  webUrl: string;
}

export interface GraphDrive {
  id: string;
  name: string;
  webUrl: string;
  driveType?: string;
}

export interface GraphDriveItem {
  id: string;
  name: string;
  size?: number;
  webUrl?: string;
  lastModifiedDateTime?: string;
  createdDateTime?: string;
  folder?: { childCount?: number };
  file?: { mimeType?: string };
  parentReference?: { path?: string; driveId?: string };
}

export interface DriveWalkProgress {
  files: number;
  folders: number;
  currentPath: string;
}

export type DriveWalkCancel = () => boolean;

async function graphFetch(url: string): Promise<Response> {
  const token = requireSharePointAccessToken();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error("Microsoft session expired. Sign in again from Settings → SharePoint.");
    }
    if (response.status === 403) {
      throw new Error(
        "Access denied by Microsoft Graph. Ask IT to grant Sites.Read.All and Files.Read.All (admin consent may be required).",
      );
    }
    throw new Error(`Graph request failed (${response.status}): ${text.slice(0, 400)}`);
  }
  return response;
}

async function graphGetJson<T>(url: string): Promise<T> {
  const response = await graphFetch(url);
  return (await response.json()) as T;
}

async function graphGetAllPages<T>(firstUrl: string): Promise<T[]> {
  const items: T[] = [];
  let url: string | null = firstUrl;
  while (url) {
    const page: { value?: T[]; "@odata.nextLink"?: string } = await graphGetJson(url);
    if (Array.isArray(page.value)) {
      items.push(...page.value);
    }
    url = page["@odata.nextLink"] ?? null;
  }
  return items;
}

function siteLabel(site: { displayName?: string; name?: string; webUrl?: string }): string {
  return site.displayName || site.name || site.webUrl || "SharePoint site";
}

export async function listAccessibleSites(): Promise<GraphSite[]> {
  const byId = new Map<string, GraphSite>();

  const followed = await graphGetAllPages<{
    id?: string;
    name?: string;
    displayName?: string;
    webUrl?: string;
  }>(`${GRAPH}/me/followedSites?$select=id,name,displayName,webUrl&$top=200`);

  for (const site of followed) {
    if (!site.id) {
      continue;
    }
    byId.set(site.id, {
      id: site.id,
      name: site.name ?? "",
      displayName: siteLabel(site),
      webUrl: site.webUrl ?? "",
    });
  }

  try {
    const searched = await graphGetAllPages<{
      id?: string;
      name?: string;
      displayName?: string;
      webUrl?: string;
    }>(`${GRAPH}/sites?search=*&$select=id,name,displayName,webUrl&$top=200`);
    for (const site of searched) {
      if (!site.id || byId.has(site.id)) {
        continue;
      }
      byId.set(site.id, {
        id: site.id,
        name: site.name ?? "",
        displayName: siteLabel(site),
        webUrl: site.webUrl ?? "",
      });
    }
  } catch {
    // followedSites alone is enough when search is restricted.
  }

  return [...byId.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function listSiteDrives(siteId: string): Promise<GraphDrive[]> {
  const drives = await graphGetAllPages<{
    id?: string;
    name?: string;
    webUrl?: string;
    driveType?: string;
  }>(`${GRAPH}/sites/${encodeURIComponent(siteId)}/drives?$select=id,name,webUrl,driveType`);

  return drives
    .filter((drive): drive is { id: string; name: string; webUrl?: string; driveType?: string } => Boolean(drive.id && drive.name))
    .map((drive) => ({
      id: drive.id,
      name: drive.name,
      webUrl: drive.webUrl ?? "",
      driveType: drive.driveType,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function resolveSiteByUrl(hostname: string, sitePath: string): Promise<GraphSite> {
  const path = sitePath.replace(/^\/+|\/+$/g, "");
  const siteKey = path.length > 0 ? `${hostname}:/${path}` : `${hostname}:`;
  const site = await graphGetJson<{
    id?: string;
    name?: string;
    displayName?: string;
    webUrl?: string;
  }>(`${GRAPH}/sites/${siteKey}?$select=id,name,displayName,webUrl`);
  if (!site.id) {
    throw new Error("Could not resolve that SharePoint site URL.");
  }
  return {
    id: site.id,
    name: site.name ?? "",
    displayName: siteLabel(site),
    webUrl: site.webUrl ?? "",
  };
}

export async function resolveDriveFromLibraryUrl(libraryUrl: string): Promise<{
  site: GraphSite;
  drive: GraphDrive;
}> {
  const parsed = parseSharePointLibraryUrl(libraryUrl);
  if (!parsed) {
    throw new Error(
      "Paste a SharePoint library URL like https://contoso.sharepoint.com/sites/SiteName/LibraryName/Forms/AllItems.aspx",
    );
  }
  const site = await resolveSiteByUrl(parsed.hostname, parsed.sitePath);
  const drives = await listSiteDrives(site.id);
  if (drives.length === 0) {
    throw new Error("No document libraries found on that site.");
  }
  if (!parsed.libraryName) {
    return { site, drive: drives[0] };
  }
  const wanted = parsed.libraryName.toLowerCase();
  const match =
    drives.find((drive) => drive.name.toLowerCase() === wanted) ??
    drives.find((drive) => {
      try {
        const path = new URL(drive.webUrl).pathname.toLowerCase();
        return path.includes(`/${wanted.toLowerCase()}`);
      } catch {
        return false;
      }
    });
  if (!match) {
    throw new Error(
      `Library “${parsed.libraryName}” not found on ${site.displayName}. Available: ${drives.map((d) => d.name).join(", ")}`,
    );
  }
  return { site, drive: match };
}

const ITEM_SELECT = "id,name,size,folder,file,webUrl,lastModifiedDateTime,createdDateTime,parentReference";

export async function listDriveChildren(driveId: string, itemId: string | "root"): Promise<GraphDriveItem[]> {
  const path =
    itemId === "root"
      ? `${GRAPH}/drives/${encodeURIComponent(driveId)}/root/children`
      : `${GRAPH}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/children`;
  return graphGetAllPages<GraphDriveItem>(`${path}?$select=${ITEM_SELECT}&$top=200`);
}

export async function walkDriveItems(
  driveId: string,
  options: {
    onProgress?: (progress: DriveWalkProgress) => void;
    isCancelled?: DriveWalkCancel;
    maxItems?: number;
  } = {},
): Promise<GraphDriveItem[]> {
  const maxItems = options.maxItems ?? 50_000;
  const collected: GraphDriveItem[] = [];
  const progress: DriveWalkProgress = { files: 0, folders: 0, currentPath: "" };

  async function visit(itemId: string | "root", relativePath: string): Promise<void> {
    if (options.isCancelled?.()) {
      throw new Error("SharePoint import cancelled.");
    }
    if (collected.length >= maxItems) {
      throw new Error(`SharePoint library exceeds the ${maxItems.toLocaleString()} item import limit.`);
    }
    progress.currentPath = relativePath || "/";
    options.onProgress?.({ ...progress });

    const children = await listDriveChildren(driveId, itemId);
    for (const child of children) {
      if (options.isCancelled?.()) {
        throw new Error("SharePoint import cancelled.");
      }
      if (collected.length >= maxItems) {
        throw new Error(`SharePoint library exceeds the ${maxItems.toLocaleString()} item import limit.`);
      }
      collected.push(child);
      const childPath = relativePath ? `${relativePath}/${child.name}` : child.name;
      if (child.folder) {
        progress.folders += 1;
        progress.currentPath = childPath;
        options.onProgress?.({ ...progress });
        await visit(child.id, childPath);
      } else if (child.file) {
        progress.files += 1;
        progress.currentPath = childPath;
        options.onProgress?.({ ...progress });
      }
    }
  }

  await visit("root", "");
  return collected;
}

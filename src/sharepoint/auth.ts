const TENANT = "organizations";
const AUTH_BASE = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0`;
const TOKEN_KEY = "prisma.ms.token.v1";
const PKCE_KEY = "prisma.ms.pkce.v1";

export const SHAREPOINT_SCOPES = [
  "openid",
  "profile",
  "offline_access",
  "User.Read",
  "Sites.Read.All",
  "Files.Read.All",
].join(" ");

export interface SharePointToken {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}

function base64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base64Url(bytes.buffer);
}

async function sha256(input: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
}

export function redirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export function loadSharePointToken(): SharePointToken | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) {
      return null;
    }
    const token = JSON.parse(raw) as SharePointToken;
    if (!token.accessToken || !token.expiresAt) {
      return null;
    }
    if (Date.now() >= token.expiresAt - 30_000) {
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function clearSharePointToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(PKCE_KEY);
}

function saveSharePointToken(token: SharePointToken): void {
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function isSharePointSignedIn(): boolean {
  return loadSharePointToken() !== null;
}

export async function beginSharePointLogin(clientId: string, scopes = SHAREPOINT_SCOPES): Promise<void> {
  const trimmed = clientId.trim();
  if (!trimmed) {
    throw new Error("Set your Microsoft Azure AD Client ID in Settings first.");
  }
  const verifier = randomString(64);
  const challenge = base64Url(await sha256(verifier));
  const state = `sp.${randomString(16)}`;
  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state, clientId: trimmed }));

  const url = new URL(`${AUTH_BASE}/authorize`);
  url.searchParams.set("client_id", trimmed);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);
  window.location.assign(url.toString());
}

export async function completeSharePointLoginFromUrl(currentUrl = window.location.href): Promise<boolean> {
  const url = new URL(currentUrl);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const raw = sessionStorage.getItem(PKCE_KEY);
  if (!raw) {
    return false;
  }
  if (error && state?.startsWith("sp.")) {
    throw new Error(url.searchParams.get("error_description") || error);
  }
  if (!code || !state || !state.startsWith("sp.")) {
    return false;
  }

  const pkce = JSON.parse(raw) as { verifier: string; state: string; clientId: string };
  if (pkce.state !== state) {
    throw new Error("Microsoft sign-in state mismatch. Try Sign in to Microsoft again.");
  }

  const body = new URLSearchParams({
    client_id: pkce.clientId,
    scope: SHAREPOINT_SCOPES,
    code,
    redirect_uri: redirectUri(),
    grant_type: "authorization_code",
    code_verifier: pkce.verifier,
  });

  const response = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Microsoft token exchange failed (${response.status}): ${text}`);
  }
  const json = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
  saveSharePointToken({
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
    refreshToken: json.refresh_token,
  });
  sessionStorage.removeItem(PKCE_KEY);

  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("session_state");
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
  return true;
}

export function requireSharePointAccessToken(): string {
  const token = loadSharePointToken();
  if (!token) {
    throw new Error("Sign in to Microsoft first (Settings → SharePoint).");
  }
  return token.accessToken;
}

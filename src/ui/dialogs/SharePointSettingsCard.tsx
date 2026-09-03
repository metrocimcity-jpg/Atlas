import { actions, useAtlas } from "@/state/store";
import type { SharePointSettings } from "@/sharepoint/settings";
import { useEffect, useState } from "react";

export function SharePointSettingsCard(): JSX.Element {
  const { sharePoint } = useAtlas();
  const [draft, setDraft] = useState<SharePointSettings>(sharePoint.settings);

  useEffect(() => {
    setDraft(sharePoint.settings);
  }, [sharePoint.settings]);

  const callback =
    typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "http://127.0.0.1:4173/";

  return (
    <div className="card acc-settings-card">
      <h3>SharePoint</h3>
      <p className="detail-hint">
        Browse sites and document libraries you can access via Microsoft Graph, then import one library into the map.
        Register an Entra ID <strong>SPA</strong> app, enable PKCE, add redirect URI{" "}
        <code>{callback}</code>, and grant delegated permissions{" "}
        <code>User.Read</code>, <code>Sites.Read.All</code>, <code>Files.Read.All</code> (admin consent may be required).
      </p>

      <label className="field-label" htmlFor="ms-client-id">
        Azure AD Client ID
      </label>
      <input
        id="ms-client-id"
        value={draft.clientId}
        placeholder="Application (client) ID from Entra ID"
        onChange={(event) => setDraft({ ...draft, clientId: event.target.value })}
      />

      <div className="detail-actions">
        <button
          type="button"
          className="primary"
          onClick={() => {
            actions.saveSharePointSettings(draft);
          }}
        >
          Save SharePoint settings
        </button>
        {sharePoint.signedIn ? (
          <button type="button" onClick={() => actions.signOutSharePoint()}>
            Sign out
          </button>
        ) : (
          <button type="button" onClick={() => void actions.signInSharePoint()}>
            Sign in to Microsoft
          </button>
        )}
        <button type="button" onClick={() => actions.setPanel("sharePointBrowser", true)}>
          Browse SharePoint
        </button>
      </div>
      <div className="stat-line">
        <span className="k">Status</span>
        <span className="v">{sharePoint.signedIn ? "Signed in" : "Not signed in"}</span>
      </div>
      {sharePoint.message ? (
        <div className="stat-line">
          <span className="k">Import</span>
          <span className="v">{sharePoint.message}</span>
        </div>
      ) : null}
    </div>
  );
}

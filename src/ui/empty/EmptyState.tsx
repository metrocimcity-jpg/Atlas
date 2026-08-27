import { actions } from "@/state/store";

export function EmptyState(): JSX.Element {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11Z" />
      </svg>
      <h2>No files loaded yet</h2>
      <p>
        Load a real folder from your computer, or explore a generated sample project to see how it works.
      </p>
      <div className="actions">
        <button className="primary" type="button" onClick={() => void actions.openFolder()}>
          Load folder
        </button>
        <button type="button" onClick={() => actions.loadSample()}>
          Try sample data
        </button>
      </div>
    </div>
  );
}

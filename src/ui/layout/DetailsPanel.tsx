import { actions, useAtlas } from "@/state/store";
import { formatBytes, formatDate, formatNumber } from "@/utils/format";
import { findVizNode } from "@/visualization/tree";

function daysAgo(value: string | null): string {
  if (!value) {
    return "—";
  }
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return "—";
  }
  return String(Math.max(0, Math.round((Date.now() - then) / 86_400_000)));
}

export function DetailsPanel(): JSX.Element {
  const { selectedId, index, vizTree } = useAtlas();
  const node = selectedId ? index?.items.find((item) => item.id === selectedId) ?? null : null;
  const group = !node && selectedId && vizTree ? findVizNode(vizTree, selectedId) : null;

  return (
    <div className="card">
      <h3>
        Selection
        <button className="reset-link" type="button" onClick={() => actions.select(null)}>
          clear
        </button>
      </h3>
      {node?.nodeType === "file" ? (
        <>
          <div className="detail-title">{node.name}</div>
          <div className="detail-path">{node.path}</div>
          <div className="stat-line">
            <span className="k">Size</span>
            <span className="v">{formatBytes(node.size)}</span>
          </div>
          <div className="stat-line">
            <span className="k">Type</span>
            <span className="v">{node.extension ?? "no extension"}</span>
          </div>
          <div className="stat-line">
            <span className="k">Modified</span>
            <span className="v">{formatDate(node.modifiedAt)}</span>
          </div>
          <div className="stat-line">
            <span className="k">Age</span>
            <span className="v">{daysAgo(node.modifiedAt)} days</span>
          </div>
        </>
      ) : node || group ? (
        <>
          <div className="detail-title">{node?.name ?? group?.label}</div>
          <div className="stat-line">
            <span className="k">Files</span>
            <span className="v">{formatNumber(node?.stats?.fileCount ?? group?.fileCount ?? 0)}</span>
          </div>
          <div className="stat-line">
            <span className="k">Total size</span>
            <span className="v">{formatBytes(node?.stats?.totalSize ?? node?.size ?? group?.size ?? 0)}</span>
          </div>
        </>
      ) : (
        <div className="detail-empty">
          Click any tile in the map to see its details here. Click a group to drill in; use the breadcrumb above to step
          back out.
        </div>
      )}
    </div>
  );
}

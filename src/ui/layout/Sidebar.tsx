import { FilterPanel } from "@/ui/layout/FilterPanel";
import { DetailsPanel } from "@/ui/layout/DetailsPanel";
import { actions, useAtlas } from "@/state/store";
import { collectMetadataKeys } from "@/data/metadataKeys";
import { colorForExt } from "@/visualization/palettes";
import { formatBytes, formatNumber } from "@/utils/format";
import { isFilterActive } from "@/filtering/FilterEngine";
import type { ColorBy, GroupBy, LayoutMode } from "@/visualization/types";

function groupValue(groupBy: GroupBy[]): string {
  if (groupBy[0] === "folder") {
    return "folder";
  }
  if (groupBy[0] === "custom") {
    return "custom";
  }
  return groupBy.join(",");
}

function formatPropertyLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Sidebar(): JSX.Element {
  const { config, index, visibleCount, search, filters } = useAtlas();
  const viz = config.visualization;
  const files = index?.items.filter((item) => item.nodeType === "file") ?? [];
  const totalSize = index?.statistics.totalSize ?? 0;
  const matching = search.trim().length > 0 || isFilterActive(filters);
  const metadataKeys = collectMetadataKeys(index);

  const extUniverse = Object.entries(
    files.reduce<Record<string, { count: number; size: number }>>((acc, file) => {
      const ext = file.extension ?? "no extension";
      const current = acc[ext] ?? { count: 0, size: 0 };
      current.count += 1;
      current.size += file.size;
      acc[ext] = current;
      return acc;
    }, {}),
  )
    .map(([ext, stats]) => ({ ext, ...stats }))
    .sort((a, b) => b.size - a.size);

  const top = extUniverse.slice(0, 8);
  const maxSize = top[0]?.size ?? 1;
  const stacking = viz.style.stacking;

  return (
    <aside className="sidebar" aria-label="Explorer controls">
      <FilterPanel />

      <div className="card">
        <h3>View</h3>
        <label className="field-label" htmlFor="group-by">
          Group by
        </label>
        <select
          id="group-by"
          value={groupValue(viz.groupBy)}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "custom") {
              const property = viz.customProperty || metadataKeys[0] || "";
              actions.patchVisualization({ groupBy: ["custom"], customProperty: property });
              return;
            }
            actions.patchVisualization({ groupBy: value.split(",") as GroupBy[] });
          }}
        >
          <option value="folder">Folder structure</option>
          <option value="extension">File type</option>
          <option value="extension,size">File type → size</option>
          <option value="size">Size</option>
          <option value="date">Date modified</option>
          <option value="date,extension">Date modified → type</option>
          <option value="category">Category</option>
          <option value="category,fileType,extension">Category → Type → Ext</option>
          {metadataKeys.length > 0 ? <option value="custom">Document metadata…</option> : null}
        </select>

        <label className="field-label" htmlFor="color-by">
          Color by
        </label>
        <select
          id="color-by"
          value={viz.colorBy}
          onChange={(event) => {
            const value = event.target.value as ColorBy;
            if (value === "custom") {
              const property = viz.customProperty || metadataKeys[0] || "";
              actions.patchVisualization({ colorBy: "custom", customProperty: property });
              return;
            }
            actions.patchVisualization({ colorBy: value });
          }}
        >
          <option value="extension">File type</option>
          <option value="fileSize">Size</option>
          <option value="modifiedDate">Recency</option>
          <option value="category">Category</option>
          <option value="folder">Folder</option>
          {metadataKeys.length > 0 ? <option value="custom">Document metadata…</option> : null}
        </select>

        {metadataKeys.length > 0 && (viz.groupBy[0] === "custom" || viz.colorBy === "custom") ? (
          <>
            <label className="field-label" htmlFor="custom-property">
              Metadata property
            </label>
            <select
              id="custom-property"
              value={viz.customProperty || metadataKeys[0]}
              onChange={(event) => actions.patchVisualization({ customProperty: event.target.value })}
            >
              {metadataKeys.map((key) => (
                <option key={key} value={key}>
                  {formatPropertyLabel(key)}
                </option>
              ))}
            </select>
          </>
        ) : null}

        <label className="field-label" htmlFor="display">
          Display
        </label>
        <select
          id="display"
          value={stacking}
          onChange={(event) =>
            actions.patchVisualization({
              layout: (event.target.value === "flattened" ? "sunburst" : "foam") as LayoutMode,
              style: {
                stacking: event.target.value === "flattened" ? "flattened" : "hierarchical",
                foamLayout: "relaxed",
              },
            })
          }
        >
          <option value="flattened">Flattened (see all levels)</option>
          <option value="hierarchical">Hierarchical (drill down)</option>
        </select>
      </div>

      <div className="card">
        <h3>Overview</h3>
        {index ? (
          <>
            <div className="stat-line">
              <span className="k">Total files</span>
              <span className="v">{formatNumber(index.statistics.totalFiles)}</span>
            </div>
            <div className="stat-line">
              <span className="k">Total size</span>
              <span className="v">{formatBytes(totalSize)}</span>
            </div>
            {matching ? (
              <>
                <div className="stat-line">
                  <span className="k">Matching</span>
                  <span className="v accentv">{formatNumber(visibleCount)}</span>
                </div>
              </>
            ) : null}
            <label className="field-label">Top types by size</label>
            {top.map((entry) => {
              const pct = totalSize ? (entry.size / totalSize) * 100 : 0;
              const fill = colorForExt(entry.ext === "no extension" ? null : entry.ext);
              return (
                <div className="legend-row" key={entry.ext}>
                  <span className="sw" style={{ background: fill }} />
                  <span className="name" title={entry.ext}>
                    {entry.ext}
                  </span>
                  <span className="bar-track">
                    <span className="bar-fill" style={{ width: `${(entry.size / maxSize) * 100}%`, background: fill }} />
                  </span>
                  <span className="pct">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </>
        ) : (
          <div className="detail-empty">Load a folder to see totals and type breakdown.</div>
        )}
      </div>

      <DetailsPanel />
    </aside>
  );
}

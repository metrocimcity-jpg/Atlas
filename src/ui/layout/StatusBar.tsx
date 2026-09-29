import { isFilterActive } from "@/filtering/FilterEngine";
import { usePrisma } from "@/state/store";
import { formatBytes, formatDuration, formatNumber } from "@/utils/format";

export function StatusBar(): JSX.Element {
  const { index, visibleCount, scan, scanning, loadError, search, filters, acc } = usePrisma();
  const totalFiles = index?.statistics.totalFiles ?? 0;
  const totalSize = index?.statistics.totalSize ?? 0;
  const filtering = Boolean(index) && (search.trim().length > 0 || isFilterActive(filters));

  return (
    <footer className="statusbar">
      {loadError ? <span className="error-banner">{loadError}</span> : null}
      {!loadError && acc.resolveMessage ? <span className="hl">{acc.resolveMessage}</span> : null}
      {!index && !loadError ? <span>Ready.</span> : null}
      {index && filtering ? (
        <span>
          <span className="match-dot" />
          <span className="hl">{formatNumber(visibleCount)}</span> of {formatNumber(totalFiles)} files match
          {" "}
          <span className="sep">·</span>{" "}
          <span className="hl">{formatBytes(totalSize)}</span> total
        </span>
      ) : null}
      {index && !filtering ? (
        <span>
          <span className="hl">{formatNumber(totalFiles)}</span> files <span className="sep">·</span>{" "}
          <span className="hl">{formatBytes(totalSize)}</span> total
        </span>
      ) : null}
      {scan ? (
        <span>
          {scan.phase} · {formatNumber(scan.filesScanned)} files · {formatDuration(scan.elapsedMs)}
          {scanning ? " · Scanning…" : ""}
        </span>
      ) : null}
    </footer>
  );
}

import { actions, usePrisma } from "@/state/store";
import { colorForExt } from "@/visualization/palettes";
import { useEffect, useState } from "react";

export function FilterPanel(): JSX.Element {
  const { filters, index, search } = usePrisma();
  const [searchDraft, setSearchDraft] = useState(search);
  const files = index?.items.filter((item) => item.nodeType === "file") ?? [];

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== search) {
        actions.setSearch(searchDraft);
      }
    }, 160);
    return () => window.clearTimeout(timer);
  }, [searchDraft, search]);

  const extUniverse = Object.entries(
    files.reduce<Record<string, number>>((acc, file) => {
      const ext = file.extension ?? "no extension";
      acc[ext] = (acc[ext] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([ext, count]) => ({ ext, count }))
    .sort((a, b) => b.count - a.count);

  const toggleExt = (ext: string): void => {
    const current = filters.extensions;
    const next = current.includes(ext) ? current.filter((item) => item !== ext) : [...current, ext];
    actions.patchFilters({ extensions: next });
  };

  return (
    <div className="card">
      <h3>Search</h3>
      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          className="search"
          value={searchDraft}
          placeholder="filename or path contains…"
          onChange={(event) => setSearchDraft(event.target.value)}
          aria-label="Search"
        />
      </div>

      <label className="field-label">File type</label>
      <div className="chips">
        {extUniverse.map((entry) => (
          <button
            key={entry.ext}
            type="button"
            className={filters.extensions.includes(entry.ext) ? "chip active" : "chip"}
            onClick={() => toggleExt(entry.ext)}
          >
            <span className="sw" style={{ background: colorForExt(entry.ext === "no extension" ? null : entry.ext) }} />
            {entry.ext} <span className="cnt">{entry.count}</span>
          </button>
        ))}
      </div>

      <label className="field-label">Size range (KB)</label>
      <div className="row-2" key={`${filters.sizeMin ?? ""}-${filters.sizeMax ?? ""}`}>
        <input
          type="number"
          min={0}
          placeholder="min"
          defaultValue={filters.sizeMin ? String(Math.round(filters.sizeMin / 1024)) : ""}
          onBlur={(event) => {
            const raw = event.target.value.trim();
            actions.patchFilters({ sizeMin: raw ? Number(raw) * 1024 : null });
          }}
        />
        <input
          type="number"
          min={0}
          placeholder="max"
          defaultValue={filters.sizeMax ? String(Math.round(filters.sizeMax / 1024)) : ""}
          onBlur={(event) => {
            const raw = event.target.value.trim();
            actions.patchFilters({ sizeMax: raw ? Number(raw) * 1024 : null });
          }}
        />
      </div>

      <label className="field-label">Modified between</label>
      <div className="row-2" key={`${filters.modifiedAfter ?? ""}-${filters.modifiedBefore ?? ""}`}>
        <input
          type="date"
          value={filters.modifiedAfter?.slice(0, 10) ?? ""}
          onChange={(event) =>
            actions.patchFilters({
              modifiedAfter: event.target.value ? new Date(event.target.value).toISOString() : null,
            })
          }
        />
        <input
          type="date"
          value={filters.modifiedBefore?.slice(0, 10) ?? ""}
          onChange={(event) =>
            actions.patchFilters({
              modifiedBefore: event.target.value ? new Date(`${event.target.value}T23:59:59`).toISOString() : null,
            })
          }
        />
      </div>

      <button className="clear-filters" type="button" onClick={() => actions.clearFilters()}>
        clear all filters
      </button>
    </div>
  );
}

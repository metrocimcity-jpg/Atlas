# Atlas

Visual filesystem analytics explorer. Scan a folder (or load a versioned JSON index) and inspect it with **Carrot Search FoamTree** — the official Voronoi treemap engine — plus search, filters, grouping, coloring, and live appearance tuning.

The visualization uses the `@carrotsearch/foamtree` package (demo distribution). Atlas does not reimplement FoamTree’s layout.

## Architecture

```text
src/
  scanner/         filesystem traversal
  data/            schema, aggregation, JSON index
  metadata/        classification + metadata providers
  visualization/   grouping, FoamTree adapter, color/size mappers
  filtering/       composable filters
  search/          query parser + fuzzy search
  config/          defaults, presets, workspaces
  ui/              shell, panels, FoamTree host, dialogs
```

The JSON index is a first-class artifact. Visualization never requires a live rescan.

## Prerequisites

- Node.js 20+
- Chrome or Edge for folder scanning (File System Access API)

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the printed local URL. Then:

1. **Open folder** — recursive scan with progress, writes an in-memory index you can export as `<root>.index.json`.
2. **Open JSON** — load a previously exported index (no filesystem walk).
3. **Load sample project** — Harbor-Bridge fixture for UI review without a local tree.

## Build

```bash
npm run build
npm run preview
```

## Scanning

- Permission errors and locked files are recorded in `errors` and do not abort the scan.
- Cryptographic hashing is not performed.
- Browser scans cannot observe created/accessed times, NTFS attributes, or symlink identity; those fields stay `null` rather than guessed.
- Specialized metadata (for example image pixel size) is only stored when a provider actually extracts it.

## JSON index

Schema version `1.0`. Shape:

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "",
  "generatorVersion": "0.1.0",
  "root": { "id": "/", "name": "", "path": "" },
  "statistics": {},
  "items": [],
  "errors": []
}
```

Load this file later with **Open JSON**. Workspaces (`atlas.workspace.json`) store view state only — not a second copy of file metadata.

## Configuration

Toolbar controls: Group By, Color By, Size By, Layout, Presets, Dark/Light.

Settings exposes live visualization tuning (padding, radius, opacity, labels, palettes). Reset returns to defaults.

Built-in presets: BIM Analysis, CAD Analysis, Large Files, Recently Modified, Engineering, Archive.

## Search

Examples:

```text
bridge
ext:dwg
category:BIM
size:>100MB
modified:>2026-01-01
name:harbor AND path:BIM
```

## Keyboard

| Shortcut | Action |
| --- | --- |
| Ctrl+O | Open folder |
| Ctrl+Shift+O | Open JSON |
| Ctrl+F | Focus search |
| Ctrl+K | Command palette |
| Esc | Clear selection / close overlay / navigate up |
| Backspace | Navigate back |

## Tests

```bash
npm test
npm run typecheck
```

## Troubleshooting

- **Open folder disabled / error** — use Chromium (Chrome, Edge, or a Chromium-based Electron shell). Firefox does not implement `showDirectoryPicker`.
- **Malformed JSON** — Atlas reports validation errors and does not crash.
- **Empty visualization after filters** — Clear all filters or widen the query; the status bar shows `Showing X of Y files`.

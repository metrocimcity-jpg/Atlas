# Atlas

Visual filesystem analytics explorer. Scan a folder (or load a versioned JSON index) and inspect it with **Carrot Search FoamTree** — the official Voronoi treemap engine — plus search, filters, grouping, coloring, and a FoamTree settings panel.

The visualization uses the `@carrotsearch/foamtree` package (demo distribution). Atlas does not reimplement FoamTree’s layout.

## Default look vs Disk Atlas

| Mode | Meaning |
| --- | --- |
| **Default** | FoamTree factory styling from the [settings demo](https://get.carrotsearch.com/foamtree/latest/demos/settings.html): rainbow colors, gradient fills, hierarchical stacking, Oxygen labels, light stage |
| **Disk Atlas preset** | Previous Atlas chrome/style from `context/file-treemap-explorer.html`: flattened stacking, plain fills, Inter labels, extension-based file coloring, dark stage |

Apply **Disk Atlas** from Settings → Presets → Appearance (or the Disk Atlas analysis preset under More).

## Architecture

```text
src/
  scanner/         filesystem traversal
  data/            schema, aggregation, JSON index
  metadata/        classification + metadata providers
  visualization/   grouping, color/size mappers, FoamTree adapter
    foamtree/      dataObject, options, settingsSchema, stylePresets
  filtering/       composable filters
  search/          query parser + fuzzy search
  config/          defaults, analysis presets, workspaces
  ui/              shell, sidebar, FoamTree host, settings panel
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

1. **Load folder** — recursive scan with progress; export as `<root>.index.json`.
2. **Open JSON** (More) — load a previously exported index (no filesystem walk).
3. **Sample data** — Harbor-Bridge fixture for UI review without a local tree.
4. **Settings** — FoamTree options, color/style presets, export settings JSON.

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

## UI layout

```text
Top bar → crumb bar → [ left sidebar | FoamTree stage | settings panel ] → status bar
```

Left sidebar: Search, View, Overview, Selection.

## Configuration

- **View card:** Group By, Color By, Display (flattened / hierarchical)
- **Settings panel:** FoamTree options (layout, borders, fill, stroke, rainbow, labels, animation) with live updates
- **Style presets:** Appearance (FoamTree defaults, Disk Atlas), Color scheme, Borders & fill, Layout, Animation
- **Analysis presets (More):** Disk Atlas, BIM, CAD, Large Files, Recently Modified, Engineering, Archive

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
- **Empty visualization after filters** — clear all filters or widen the query; the status bar shows matching counts.
- **Want the old Disk Atlas look** — Settings → Presets → Appearance → Disk Atlas.

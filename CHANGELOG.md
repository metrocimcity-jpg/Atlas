# Changelog

## 0.3.0

- Default FoamTree look matches the official factory / [settings demo](https://get.carrotsearch.com/foamtree/latest/demos/settings.html) (rainbow, gradients, hierarchical stacking).
- Disk Prisma UI and flattened extension coloring preserved as an Appearance / analysis preset (`context/file-treemap-explorer.html`).
- Settings panel modeled on FoamTree settings: search, foldable sections, color/style/layout/animation presets, export settings JSON.
- Color models: `rainbow` (default) and `atlas` (file-type decorator).
- Chrome layout: top bar, crumb bar, left sidebar cards, full-bleed stage, right settings panel, status bar.

## 0.2.0

- Visualization embeds Carrot Search FoamTree (`@carrotsearch/foamtree`) instead of a custom canvas foam.
- Layout modes map to FoamTree relaxed, squarified, fisheye, and flattened stacking.

## 0.1.0

- Initial Prisma explorer: recursive folder scan, versioned JSON index, CSV export.
- Foam / treemap / circle / sunburst layouts with group, color, and size mapping.
- Search (including field syntax), composable filters, presets, and workspaces.
- Dark/light themes and live visualization tuning.

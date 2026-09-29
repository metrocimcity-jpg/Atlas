# Project Overview

## Mission

Build a production-quality visual filesystem explorer powered by **Carrot Search FoamTree** (`@carrotsearch/foamtree`).

Use the official FoamTree package for layout and rendering. Do not reimplement Voronoi layout, relaxation, or FoamTree drawing in custom canvas code.

The application must:

- Scan a user-selected folder recursively.
- Extract available filesystem and file-specific metadata.
- Export a versioned JSON index.
- Load an existing JSON index without rescanning.
- Visualize folders/files with FoamTree (relaxed / squarified / flattened stacking).
- Support search, filtering, grouping, coloring, sizing, drill-down, and details.
- Provide a FoamTree settings panel with color and style presets.
- Remain performant on large datasets.

## Product Principle

The application is not merely a colorful file manager. It is a visual filesystem analytics and exploration tool.

## Default Look vs Disk Prisma

- **Default appearance** matches the official FoamTree factory settings from the [FoamTree settings demo](https://get.carrotsearch.com/foamtree/latest/demos/settings.html): rainbow color model, gradient fills, hierarchical stacking, Oxygen labels, light stage.
- **Disk Prisma** (from `context/file-treemap-explorer.html`) is preserved as an **Appearance / color / style preset**: gold/teal chrome cues, flattened stacking, plain fills, Inter labels, extension-based file coloring.

## Primary Workflow

1. Select folder (or load sample / JSON).
2. Scan recursively with progress.
3. Generate / export `<root>.index.json`.
4. Visualize indexed data with FoamTree.
5. Search / filter / group / color / size.
6. Tune FoamTree options in Settings; apply style presets.
7. Save visualization / workspace configuration.
8. Later load the JSON directly without rescanning.

## Priority Order

1. Correctness
2. Performance
3. Maintainability
4. Extensibility
5. UX
6. Visual polish

## Development Rule

Always inspect the existing repository before changing architecture. Reuse working code when practical. Do not rewrite the project unnecessarily.

When restyling FoamTree or Settings, prefer matching official FoamTree options and the Disk Prisma reference HTML rather than inventing a parallel visual system.

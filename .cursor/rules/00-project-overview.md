# Project Overview

## Mission

Build a production-quality modern visual filesystem explorer inspired by the interaction concepts of CarrotSearch FoamTree,use CarrotSearch FoamTree framework, branding, assets, or implementation.

The application must:

- Scan a user-selected folder recursively.
- Extract available filesystem and file-specific metadata.
- Export a versioned JSON index.
- Load an existing JSON index without rescanning.
- Visualize folders/files using an organic clustered layout.
- Support search, filtering, grouping, coloring, sizing, drill-down, and details.
- Provide extensive appearance and visualization tuning.
- Remain performant on large datasets.

## Product Principle

The application is not merely a colorful file manager. It is a visual filesystem analytics and exploration tool.

## Primary Workflow

1. Select folder.
2. Scan recursively.
3. Display progress.
4. Generate `<root>.index.json`.
5. Visualize indexed data.
6. Search/filter/group/color/resize.
7. Save visualization/workspace configuration.
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

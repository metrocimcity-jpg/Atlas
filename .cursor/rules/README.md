# Cursor Rules Index

Read these rules before implementing features.

- `00-project-overview.md` — product mission; FoamTree default vs Disk Atlas preset
- `01-architecture.md` — modular architecture and FoamTree adapter
- `02-revit-cad-bim-domain.md` — engineering/BIM/CAD classifications
- `03-data-schema.md` — JSON index and data model
- `04-scanner.md` — filesystem scanning
- `05-metadata-and-classification.md` — metadata providers and file classification
- `06-visualization.md` — official FoamTree adapter, layouts, color models
- `07-search-and-filtering.md` — search and filters
- `08-ui-ux.md` — Disk Atlas chrome + FoamTree settings panel layout
- `09-design-system.md` — tokens, palettes, FoamTree style model
- `10-performance.md` — large dataset performance
- `11-security.md` — filesystem and JSON security
- `12-testing.md` — test requirements
- `13-cursor-workflow.md` — Cursor implementation workflow
- `14-code-style.md` — coding standards
- `15-config-and-presets.md` — style presets, analysis presets, workspaces
- `16-acceptance-criteria.md` — definition of done
- `17-commands-and-shortcuts.md` — command system
- `18-git-and-documentation.md` — repository practices

## Recent product decisions (keep in sync)

1. Visualization engine is `@carrotsearch/foamtree` (not a custom canvas FoamTree clone).
2. Default look = FoamTree factory / settings-demo defaults.
3. Disk Atlas look = Appearance preset (`diskAtlasStyle`), reference `context/file-treemap-explorer.html`.
4. Settings panel mirrors the official FoamTree settings demo (search, sections, presets, export JSON).

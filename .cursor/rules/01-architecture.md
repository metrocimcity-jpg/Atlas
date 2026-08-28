# Architecture Rules

## General

Use a modular architecture. Do not create a giant `App` component, giant scanner file, or monolithic utility module.

Recommended separation:

```text
scanner/
data/
metadata/
visualization/
  foamtree/     FoamTree adapter, options, settings schema, style presets
filtering/
search/
ui/
config/
state/
utils/
```

## Responsibilities

### Scanner

Filesystem traversal and metadata extraction only.

### Data

Schema, normalization, indexing, aggregation, serialization/deserialization.

### Visualization

Hierarchy transformation (grouping), color/size mappers, and the FoamTree adapter.

Rendering of cells is FoamTree’s job. Atlas only:

- builds `dataObject` groups
- maps config → FoamTree options
- hosts the FoamTree instance in the UI

### Filtering

Pure filter definitions and filter execution.

### Search

Search indexing, parsing, fuzzy matching, query evaluation.

### UI

Shell, top bar, crumb bar, left sidebar cards, FoamTree stage, settings panel, dialogs.

### Config

Application defaults, analysis presets, FoamTree style presets, saved workspace state.

## Dependency Direction

Prefer:

```text
UI -> application state/services -> domain/data
Visualization/foamtree -> domain/data + typed VisualizationConfig
Scanner -> filesystem + metadata providers
Search -> normalized data
Filtering -> normalized data
```

Avoid circular dependencies.

## Interfaces

Use interfaces for replaceable systems:

- `FileScanner`
- `MetadataProvider`
- `FileClassifier`
- `SearchEngine`
- `FilterEngine`
- `ColorMapper`
- `SizeMapper`
- `GroupingStrategy`

FoamTree itself is the layout/renderer. Keep a thin adapter rather than a second custom layout engine for the main view.

## Configuration

Do not hard-code user-tunable FoamTree values in components.

Use typed configuration objects and centralized defaults (`foamtreeDefaultStyle`, `diskAtlasStyle`).

## Extensibility

New file types, metadata providers, grouping strategies, color mappings, and FoamTree style presets should be addable without modifying unrelated subsystems.

## Reference Assets

- `context/file-treemap-explorer.html` — Disk Atlas UI + FoamTree flattened style reference
- FoamTree settings demo — factory defaults and settings-panel UX reference

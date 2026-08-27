# Architecture Rules

## General

Use a modular architecture. Do not create a giant `App` component, giant scanner file, or monolithic utility module.

Recommended separation:

```text
scanner/
data/
visualization/
filtering/
search/
ui/
themes/
config/
utils/
tests/
```

## Responsibilities

### Scanner

Filesystem traversal and metadata extraction only.

### Data

Schema, normalization, indexing, aggregation, serialization/deserialization.

### Visualization

Hierarchy transformation, layout, rendering, interaction, labels.

### Filtering

Pure filter definitions and filter execution.

### Search

Search indexing, parsing, fuzzy matching, query evaluation.

### UI

Controls, panels, dialogs, toolbars, details.

### Themes

Design tokens, palettes, visualization appearance.

### Config

Application defaults, user presets, saved workspace state.

## Dependency Direction

Prefer:

```text
UI -> application services -> domain/data
Visualization -> domain/data
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
- `VisualizationEngine`
- `ColorMapper`
- `SizeMapper`
- `GroupingStrategy`

## Configuration

Do not hard-code user-tunable visualization values in components.

Use typed configuration objects and centralized defaults.

## Extensibility

New file types, metadata providers, grouping strategies, color mappings, and visualization modes should be addable without modifying unrelated subsystems.

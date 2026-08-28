# Acceptance Criteria

The implementation is acceptable only when this end-to-end workflow works.

## Scan

User selects a folder.

The application:

1. recursively scans it;
2. displays progress;
3. handles errors without crashing;
4. creates a versioned JSON index;
5. displays aggregated statistics.

## Load

User opens an existing JSON index (or sample data).

The application:

1. validates schema (for JSON);
2. loads the data;
3. reconstructs hierarchy;
4. renders visualization with **official FoamTree**;
5. does not rescan the filesystem.

## Visualization

The default visualization uses FoamTree factory styling and supports:

- hierarchical and flattened stacking
- proportional sizing
- rainbow and Atlas color models
- drill-down / expose / open
- zoom
- selection
- labels / title bar
- live option updates from the Settings panel

**Disk Atlas** must remain available as an Appearance preset (flattened + extension coloring).

## Search

Search works for filenames and paths at minimum.

Fuzzy search is preferred.

## Filters

At minimum:

- extension
- type / category
- size
- modified date

Advanced filters should also work.

## Dynamic Visualization

Changing:

```text
Group By
Color By
Size By
Stacking / Layout
Style presets
```

must visibly change the visualization.

## Details

Selecting an item shows metadata.

Folders / groups show aggregated statistics.

## Appearance

Dark chrome theme works.

FoamTree settings panel works with search, foldable sections, presets, and JSON export.

Visualization tuning updates live.

## Export

JSON export works.

CSV export is desirable.

Workspace export stores view state without duplicating the full index.

## Reliability

Malformed JSON, inaccessible files, and missing metadata must not crash the application.

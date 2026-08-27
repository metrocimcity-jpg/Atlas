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

User opens an existing JSON index.

The application:

1. validates schema;
2. loads the data;
3. reconstructs hierarchy;
4. renders visualization;
5. does not rescan the filesystem.

## Visualization

The default visualization is FoamTree-inspired and supports:

- hierarchical groups
- proportional sizing
- configurable coloring
- clustering
- drill-down
- zoom
- pan
- selection
- tooltips
- labels

## Search

Search works for filenames and paths at minimum.

Fuzzy search is preferred.

## Filters

At minimum:

- extension
- type
- category
- size
- modified date

Advanced filters should also work.

## Dynamic Visualization

Changing:

```text
Group By
Color By
Size By
```

must visibly change the visualization.

## Details

Selecting an item shows metadata.

Folders show aggregated statistics.

## Appearance

Dark/light themes work.

Visualization tuning works live.

## Export

JSON export works.

CSV export is desirable.

## Reliability

Malformed JSON, inaccessible files, and missing metadata must not crash the application.

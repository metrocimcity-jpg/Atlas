# Search and Filtering Rules

## Search

Search must support:

- filename
- folder name
- extension
- full path
- category
- file type
- metadata

Use an indexed search approach for large datasets.

Support fuzzy matching.

Debounce interactive search.

## Query Syntax

Prefer support for:

```text
ext:dwg
type:CAD
category:BIM
size:>100MB
size:<1GB
modified:>2026-01-01
created:<2025-01-01
name:bridge
path:project
```

Support AND/OR where practical.

## Filters

Provide:

- extension
- file type
- category
- size
- created date
- modified date
- accessed date
- hidden
- system
- read-only
- executable
- symbolic link
- has metadata
- duplicate
- recently modified
- old files
- empty folders

## Filter Engine

Filtering logic should be testable independently of React/UI.

Filters should be composable.

## UX

Show:

```text
Showing 12,483 of 52,901 items
```

Provide:

- Clear All
- saved filter presets
- active-filter chips
- counts where practical

Filtering must update the visualization efficiently.

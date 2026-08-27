# Configuration and Presets Rules

## Application Configuration

Provide a typed configuration system.

Example:

```json
{
  "theme": "dark",
  "sizeBy": "fileSize",
  "colorBy": "category",
  "groupBy": "folder",
  "animation": true,
  "animationDuration": 500,
  "showLabels": true,
  "labelThreshold": 20
}
```

## Visualization Presets

Users should be able to save presets such as:

- BIM Analysis
- CAD Analysis
- Large Files
- Recently Modified
- Engineering
- Archive

A preset may include:

```text
filters
grouping
coloring
sizing
theme
visual tuning
```

## Workspace

Support saving/loading a workspace.

Workspace may contain:

- current index
- filters
- search
- grouping
- coloring
- sizing
- theme
- visualization tuning
- panel state
- selected item

Do not store huge raw file metadata redundantly inside workspace files.

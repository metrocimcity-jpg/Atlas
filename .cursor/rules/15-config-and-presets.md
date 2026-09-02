# Configuration and Presets Rules

## Application Configuration

Provide a typed configuration system.

Example:

```json
{
  "theme": "dark",
  "visualization": {
    "layout": "foam",
    "sizeBy": "fileSize",
    "colorBy": "category",
    "groupBy": ["folder"],
    "palette": "rainbow",
    "showLabels": true,
    "animation": true,
    "style": {
      "colorModel": "rainbow",
      "foamLayout": "relaxed",
      "stacking": "hierarchical",
      "groupFillType": "gradient"
    }
  }
}
```

Defaults come from `defaultAppConfig()` / `foamtreeDefaultStyle()` — official FoamTree factory look.

## Style Presets (Colors & FoamTree Look)

Settings → Presets must include groups inspired by the FoamTree settings demo:

### Appearance

- **FoamTree defaults** — factory look (default)
- **Disk Atlas** — flattened + extension coloring + Disk Atlas visual style

### Color scheme

- For light backgrounds
- For dark backgrounds
- Warm colors
- Full rainbow

### Borders & fill

- Straight and flat
- Round with gradients
- Bold borders
- No borders

### Layout

- Large groups in the center (fisheye)
- Large groups in the corners (blackhole)
- Like FoamTree 2.0.x (ordered)
- Traditional treemap
- Top level initially visible (hierarchical)
- All levels initially visible (flattened)

### Animation

- No animation
- Fade in, fade out
- Gentle scaling
- Fly-in
- Bouncy rotation

## Analysis Presets

Users should also be able to apply domain presets such as:

- Disk Atlas
- BIM Analysis
- CAD Analysis
- Large Files
- Recently Modified
- Engineering
- Archive

An analysis preset may include:

```text
filters
grouping
coloring
sizing
theme
visualization style
```

## Workspace

Support saving/loading a workspace.

Workspace may contain:

- current index name / timestamp (not full metadata dump)
- filters
- search
- grouping
- coloring
- sizing
- theme
- visualization tuning
- panel state
- selected item
- focus path

Do not store huge raw file metadata redundantly inside workspace files.

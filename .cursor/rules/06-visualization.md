# Visualization Rules

## Goal

Embed **Carrot Search FoamTree** (`@carrotsearch/foamtree`) as the visualization engine.

Do not reimplement FoamTree layout, relaxation, or polygon rendering. Atlas adapts the file index into FoamTree `dataObject` groups and maps typed config onto FoamTree options.

Reference:

- Official package and [API](https://get.carrotsearch.com/foamtree/latest/api/)
- [Settings demo](https://get.carrotsearch.com/foamtree/latest/demos/settings.html) for defaults and tunable options
- `context/file-treemap-explorer.html` for the Disk Atlas look (preset, not default)

## Adapter Layer

Keep FoamTree behind a thin adapter:

```text
src/visualization/foamtree/
  dataObject.ts      VizNode -> FoamTree groups
  options.ts         VisualizationConfig -> FoamTree options
  settingsSchema.ts  Settings panel controls
  stylePresets.ts    Color / style / layout / animation presets
  host.ts            Active instance helpers
```

## Layout Modes

Atlas layout modes map to FoamTree:

| Atlas layout | FoamTree |
| --- | --- |
| `foam` | `layout: relaxed`, `stacking: hierarchical` |
| `treemap` | `layout: squarified` |
| `circles` | `relaxed` + `relaxationInitializer: fisheye` |
| `sunburst` | `relaxed` + `stacking: flattened` |

Prefer driving layout from `VisualizationStyle` fields (`foamLayout`, `stacking`, `relaxationInitializer`) and keep Atlas `layout` in sync.

## Color Models

Support two color models in style config:

- **`rainbow`** (default) — FoamTree built-in rainbow (`rainbowStartColor` / `rainbowEndColor` / distribution). Do not override with a custom group color decorator unless necessary.
- **`atlas`** — Disk Atlas extension / category coloring; folders use a neutral fill; files get palette colors. Use `groupColorDecorator` only in this mode.

## Dimensions

Users must be able to choose:

### Size By

- file size
- file count
- folder size
- equal
- age
- custom property

### Color By

- extension
- file type
- category
- MIME type
- folder
- file size
- modified date
- created date
- age
- attributes
- custom property

### Group By

- folder
- extension
- file type
- category
- subcategory
- MIME type
- date
- size
- owner
- drive
- path
- custom property

## Multi-Level Grouping

Support configurations such as:

```text
Category
  -> File Type
    -> Extension
```

## Interaction

Hover:

- highlight cell
- title bar / tooltip
- emphasize cluster

Click:

- select file or group

Double click:

- drill / open where appropriate; prevent default for leaf files when needed

Escape:

- clear selection / reset view / navigate up

Wheel:

- zoom (FoamTree `zoomMouseWheelFactor`)

Drag:

- pan / expose / open (FoamTree built-ins)

## Level of Detail

Respect FoamTree options:

- `maxGroupLevelsDrawn`
- `maxGroupLabelLevelsDrawn`
- `groupLabelMinFontSize` / `groupLabelMaxFontSize`

Do not invent a second LOD system that fights FoamTree.

## Defaults

Factory defaults come from FoamTree (`foamtreeDefaultStyle()`):

- gradient fills, hierarchical stacking, rainbow colors
- Oxygen font family (demo default)
- ~2s rollout / 1.5s pullback

Disk Atlas (`diskAtlasStyle()`) is a preset, not the factory default.

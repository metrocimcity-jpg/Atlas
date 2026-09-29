# UI / UX Rules

## Product Feel

The application should feel like a premium filesystem analytics tool with a FoamTree settings workbench on the side.

Avoid generic Bootstrap-dashboard aesthetics.

Target qualities:

- modern
- technical
- minimal
- professional
- high information density
- polished
- calm
- responsive

## Main Layout

Preferred structure (Disk Prisma chrome + FoamTree settings):

```text
Top bar (Disk Prisma brand, Sample data, Load folder, Settings, More)
------------------------------------------------
Breadcrumb bar (⌂ all files › …)
------------------------------------------------
Left sidebar | Visualization stage | FoamTree settings panel
------------------------------------------------
Status bar
```

Left sidebar cards:

- Search (query, extension chips, size/date filters)
- View (group by, color by, stacking / display)
- Overview (totals, top types legend)
- Selection (selected file / group details)

Panels should be:

- collapsible (sidebar / settings)
- keyboard accessible

## Top Bar

Include:

- Brand: **Disk** + accent **Prisma**
- Sample data
- Load folder (primary)
- Settings (toggle FoamTree settings panel)
- More menu: Open JSON, Export JSON/CSV, workspace, analysis presets, theme, commands

## Settings Panel

Model the settings UI on the official [FoamTree settings demo](https://get.carrotsearch.com/foamtree/latest/demos/settings.html):

- search box for option names
- foldable sections (Layout, Relaxation, Stacking, Borders, Fill, Stroke, Rainbow, Labels, Animation, …)
- live sliders / enums / booleans
- **Presets** section for Appearance, Color scheme, Borders & fill, Layout, Animation
- **Export settings to JSON**

Default visualization style is FoamTree factory. **Disk Prisma** must remain available as an Appearance preset.

## Details

Selected files show useful metadata (name, path, size, type, modified, age).

Selected folders / groups show aggregated statistics (files, total size).

## Breadcrumbs

Always make current hierarchy understandable.

Use Disk Prisma crumb style: `⌂ all files` with `›` separators and current accent.

## Keyboard

Recommended:

```text
Ctrl+O       Open Folder
Ctrl+Shift+O Open JSON
Ctrl+F       Search
Ctrl+K       Command Palette
Esc          Clear/close / navigate up
Backspace    Back
Enter        Open
```

## Accessibility

Support:

- keyboard navigation
- visible focus
- readable contrast
- reduced motion
- semantic controls

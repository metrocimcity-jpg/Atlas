# Design System Rules

## Centralized Tokens

Use CSS design tokens for chrome UI:

```text
--bg, --bg-alt, --panel, --panel-raised
--border, --border-soft
--text, --text-dim, --text-faint
--accent, --accent-dim, --match, --danger
--font-display, --font-ui, --font-mono
--radius-sm, --radius-md
```

Do not scatter arbitrary chrome colors through components.

Disk Prisma chrome reference (`context/file-treemap-explorer.html`):

- background `#0f1115`
- accent gold `#ffb454`
- match teal `#59d9c4`
- fonts: Space Grotesk, Inter, JetBrains Mono

FoamTree **stage** background is controlled by `VisualizationStyle.stageBackground` (factory default is light white; Disk Prisma preset uses dark `#0f1115`).

## Dark / Light Chrome

Dark mode is the primary app chrome theme.

Light theme may soft-neutralize panels; keep FoamTree stage color independent via style presets (“For light backgrounds” / “For dark backgrounds”).

## Visualization Palettes

Provide Prisma categorical palettes for `colorModel: "atlas"` and analysis presets:

- Professional / Rainbow (Disk Prisma curated extension palette)
- Dark, Light, Monochrome
- Engineering, BIM, CAD
- Heatmap, Pastel, High Contrast

FoamTree rainbow model uses `rainbowStartColor` / `rainbowEndColor` and related FoamTree options — not the categorical palette list.

## Appearance Controls

Expose FoamTree-native tuning live via the Settings panel (see `settingsSchema.ts`), including:

- layout / stacking / relaxation
- group border radius, border width, inset
- fill type and gradients
- stroke type and width
- selection outline
- rainbow colors
- labels (font, min/max size, levels drawn)
- rollout / pullback / fade animation

All tuning must update live.

Provide:

- **FoamTree defaults** preset (factory)
- **Disk Prisma** preset (previous UI look)
- Reset / factory via FoamTree defaults preset
- Export settings JSON

## Visualization Style Model

Prefer a FoamTree-aligned style object (see `VisualizationStyle` in `src/visualization/types.ts`), for example:

```ts
interface VisualizationStyle {
  colorModel: "rainbow" | "atlas";
  stageBackground: string;
  foamLayout: "relaxed" | "ordered" | "squarified";
  stacking: "hierarchical" | "flattened";
  groupBorderRadius: number;
  groupBorderWidth: number;
  groupInsetWidth: number;
  groupFillType: "none" | "plain" | "gradient";
  groupStrokeType: "none" | "plain" | "gradient";
  rainbowStartColor: string;
  rainbowEndColor: string;
  groupLabelFontFamily: string;
  rolloutDuration: number;
  // …additional FoamTree options mirrored in settingsSchema
}
```

Do not reintroduce a parallel “padding / gap / cornerRadius only” model that does not map cleanly to FoamTree.

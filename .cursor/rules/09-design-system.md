# Design System Rules

## Centralized Tokens

Use design tokens for:

```text
background
surface
surface-elevated
border
text-primary
text-secondary
accent
selection
hover
shadow
radius
spacing
font
```

Do not scatter arbitrary colors and spacing values through components.

## Dark Mode

Dark mode is a primary theme.

Avoid pure black and excessive neon.

Use subtle surfaces, controlled saturation, and strong hierarchy.

## Light Mode

Avoid pure white everywhere.

Use soft neutral surfaces and clear hierarchy.

## Visualization Palettes

Provide configurable presets:

- Professional
- Dark
- Light
- Monochrome
- Engineering
- BIM
- CAD
- Rainbow
- Heatmap
- Pastel
- High Contrast

## Appearance Controls

Support live tuning for:

- background
- panel opacity
- cell opacity
- border width
- border opacity
- radius
- padding
- spacing
- text size
- label opacity
- shadows
- animation speed
- hover intensity
- selection effect
- cluster separation

## Visualization Tuning

Expose a dedicated tuning model such as:

```ts
interface VisualizationStyle {
  groupPadding: number;
  groupGap: number;
  cellPadding: number;
  borderWidth: number;
  borderOpacity: number;
  cornerRadius: number;
  shadowBlur: number;
  shadowOpacity: number;
  hoverScale: number;
  selectionScale: number;
  animationDuration: number;
  labelMinSize: number;
  labelMaxSize: number;
  labelOpacity: number;
}
```

All tuning must update live.

Provide Reset to Defaults.

# UI / UX Rules

## Product Feel

The application should feel like a premium professional data-visualization and engineering tool.

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

Preferred structure:

```text
Toolbar
------------------------------------------------
Filters | Main Visualization | Details
------------------------------------------------
Status / Statistics
```

Panels should be:

- collapsible
- resizable where practical
- keyboard accessible

## Toolbar

Include:

- Open Folder
- Open JSON
- Search
- Filter
- Group By
- Color By
- Size By
- Layout
- Settings

## Details

Selected files should show useful metadata.

Selected folders should show aggregated statistics.

## Context Menu

Provide safe actions such as:

- Open
- Open Containing Folder
- Copy Path
- Copy Relative Path
- Properties
- Focus
- Bookmark
- Exclude

Destructive operations require confirmation.

## Breadcrumbs

Always make current hierarchy understandable.

## Keyboard

Recommended:

```text
Ctrl+O       Open Folder
Ctrl+Shift+O Open JSON
Ctrl+F       Search
Ctrl+K       Command Palette
Esc          Clear/close
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

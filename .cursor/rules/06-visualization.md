# Visualization Rules

## Goal

Create an original FoamTree-inspired visualization using organic clustered cells and hierarchical navigation.

Do not copy proprietary FoamTree source code or implementation.

## Visualization Concepts

Support:

- organic packed cells
- hierarchical clusters
- drill-down
- zoom
- pan
- focus
- selection
- hover emphasis
- animated transitions
- breadcrumb navigation

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
- show tooltip
- emphasize cluster

Click:

- select file
- select folder

Double click:

- open/drill into item where appropriate

Escape:

- clear selection

Wheel:

- zoom

Drag:

- pan

## Level of Detail

Do not render every label for large datasets.

Use label thresholds and progressive detail.

## Visualization Abstraction

Keep the rendering engine behind an interface so future layouts can be added:

- FoamTree-inspired
- treemap
- circle packing
- sunburst
- tree

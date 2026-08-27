# Testing Rules

Every major subsystem should have automated tests.

## Scanner Tests

Test:

- files
- directories
- empty folders
- inaccessible entries
- Unicode paths
- symbolic links
- broken links
- long names
- cancellation

## Metadata Tests

Test:

- image metadata
- PDF metadata
- Office metadata where supported
- unknown file types
- unavailable metadata

## Classification Tests

Test common extensions and unknown extensions.

## Filter Tests

Test:

- size
- date
- extension
- category
- type
- attributes
- combinations

## Search Tests

Test:

- exact
- partial
- fuzzy
- path
- advanced syntax
- AND
- OR

## Visualization Tests

Test:

- hierarchy generation
- folder aggregation
- grouping
- coloring
- sizing
- selection
- filtering integration

## Regression Rule

Every bug fixed should receive a regression test when practical.

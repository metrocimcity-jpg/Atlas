# Performance Rules

## Target Scale

Design for:

- 1,000 files
- 10,000 files
- 100,000 files
- 1,000,000+ files where practical

## UI

Never block the main thread with expensive filesystem or data processing.

Use:

- workers
- incremental processing
- memoization
- virtualization
- lazy loading
- level of detail
- indexed search

where appropriate.

## Rendering

Do not render labels for every item in huge datasets.

Render only what is useful at the current zoom/detail level.

## Filtering

Avoid recomputing expensive derived structures unnecessarily.

Cache or memoize stable computations.

## Scanner

Avoid redundant stat calls.

Do not hash all files unless requested.

## Memory

Do not retain duplicate copies of very large datasets unnecessarily.

Prefer normalized structures for large indexes.

## Performance Testing

Create representative test datasets and measure:

- scan time
- index size
- load time
- first render
- filtering latency
- search latency
- zoom/interaction FPS where measurable

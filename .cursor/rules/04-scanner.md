# Filesystem Scanner Rules

## Scanner Goals

Create a robust recursive scanner that does not crash because one filesystem item is inaccessible.

Handle:

- permission errors
- locked files
- hidden files
- system files
- symbolic links
- junctions
- broken links
- Unicode names
- long paths
- network locations
- removable drives

## Error Handling

Record errors in the index:

```text
path
operation
errorCode
message
timestamp
```

Continue scanning where safe.

## Cancellation

Scanning must support cancellation.

The UI should show:

- current path
- files scanned
- folders scanned
- total size
- progress when determinable
- errors
- elapsed time

## Performance

Do not synchronously block the UI during large scans.

Use worker/background processing where appropriate.

Avoid unnecessary filesystem calls.

Do not calculate cryptographic hashes during every scan by default.

Hashing must be opt-in or configurable.

## Symlinks

Avoid infinite recursion.

Detect cycles and handle links according to configuration.

## Metadata

Extract common filesystem metadata first. Specialized metadata should be implemented through independent metadata providers.

# Security Rules

Filesystem data is untrusted input.

Never execute a file merely because it was indexed.

## Sanitize

Escape user-controlled:

- filenames
- paths
- metadata
- tooltip content
- JSON values

Avoid unsafe HTML injection.

## Process Execution

If OS commands are needed:

- use safe APIs
- avoid shell string concatenation
- validate arguments
- never interpolate untrusted paths into shell commands

## Destructive Operations

Rename/delete/move operations require explicit confirmation.

## JSON

Treat imported JSON as untrusted.

Validate schema before use.

Handle malformed indexes gracefully.

## Symlinks

Prevent traversal loops and unexpected access outside intended scope according to user-selected policies.

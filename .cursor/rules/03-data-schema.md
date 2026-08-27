# Data Model and JSON Schema Rules

## Requirements

The JSON index is a first-class product artifact.

It must be:

- versioned
- deterministic where practical
- portable
- readable
- extensible
- safe to load
- independent of UI state

## Root Schema

Use a structure similar to:

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "",
  "generatorVersion": "",
  "root": {},
  "statistics": {},
  "items": [],
  "errors": []
}
```

## File Node

A node may contain:

```text
id
parentId
name
path
relativePath
nodeType
extension
mimeType
fileType
category
subcategory
size
createdAt
modifiedAt
accessedAt
attributes
metadata
children
```

## IDs

Never use array indexes as persistent IDs.

IDs must remain stable during the lifetime of an index.

## Metadata

Never fabricate metadata.

Prefer:

```text
known value
null
omitted
```

rather than guessed values.

## Aggregation

Folders should have derived statistics:

- file count
- folder count
- total size
- category counts
- extension counts
- largest file
- newest file
- oldest file

## Serialization

The visualization must work from the JSON index alone.

Do not require a live filesystem scan to render an existing index.

## Schema Evolution

When changing the schema:

1. increment schema version when required;
2. provide migration logic when practical;
3. preserve backwards compatibility where feasible.

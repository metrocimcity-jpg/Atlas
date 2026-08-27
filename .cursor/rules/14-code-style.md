# Code Style Rules

## TypeScript

Prefer strict typing.

Avoid `any` unless there is a documented reason.

Use:

- interfaces for contracts
- discriminated unions for node types
- typed configuration objects
- explicit return types for important public functions

## Naming

Use descriptive names.

Avoid:

```text
data
temp
foo
bar
thing
```

when the actual concept is known.

Prefer:

```text
fileIndex
visibleNodes
groupingStrategy
visualizationConfig
metadataProvider
```

## Functions

Keep functions focused.

If a function handles:

- scanning
- classification
- UI updates
- persistence

at the same time, split it.

## Error Handling

Never silently swallow errors.

Use typed error results or structured logging where appropriate.

## Comments

Comment architectural decisions and non-obvious algorithms.

Do not add comments that merely restate the code.

## React

Prefer small components.

Avoid giant components with hundreds of lines of JSX and business logic.

Keep domain logic outside presentation components.

## State

Separate:

- filesystem/index state
- search state
- filter state
- visualization state
- UI state
- workspace state

Avoid one giant global state object when unnecessary.

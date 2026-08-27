# Cursor AI Development Workflow

## Before Coding

Always:

1. Inspect repository structure.
2. Identify framework and build system.
3. Inspect existing entry points.
4. Inspect package/dependency configuration.
5. Identify existing conventions.
6. Identify relevant reusable components.
7. Form a concise implementation plan.

Do not immediately generate large amounts of code.

## During Coding

Work in small coherent increments.

After each meaningful increment:

1. type-check
2. lint
3. run relevant tests
4. build when appropriate
5. fix errors before proceeding

## Editing

Prefer targeted edits.

Do not replace entire files unless necessary.

Preserve working functionality.

## Dependencies

Do not add a dependency simply because it is convenient.

Before adding one:

- determine whether existing dependencies solve the problem;
- consider bundle size;
- consider maintenance;
- verify compatibility.

## Generated UI

Never create decorative controls that are not implemented.

Every visible setting must either work or be clearly marked as unavailable.

## Completion

When a feature is finished, report:

- files changed
- functionality added
- tests run
- build result
- remaining limitations

## Quality Gate

Do not call a prototype "complete" if core workflow is broken.

The application must remain runnable throughout development.

# Git and Documentation Rules

## Commits

Keep commits focused.

Prefer:

```text
feat(scanner): add recursive filesystem indexing
feat(search): add fuzzy filename search
feat(view): add category clustering
fix(scanner): handle inaccessible directories
perf(view): reduce rendering cost for large indexes
```

Avoid giant commits containing unrelated changes.

## Documentation

Update documentation **and** `.cursor/rules/` when:

- public configuration changes
- JSON schema changes
- setup changes
- commands change
- new metadata providers are added
- new visualization modes are added
- FoamTree defaults / style presets change
- Disk Atlas vs factory default behavior changes
- Settings panel UX or preset groups change

Keep these in sync with the product:

- `README.md` — user-facing defaults and presets
- `CHANGELOG.md` — significant user-visible changes
- `.cursor/rules/00-project-overview.md`, `06-visualization.md`, `08-ui-ux.md`, `09-design-system.md`, `15-config-and-presets.md`

## README

README should explain:

- project purpose
- FoamTree default vs Disk Atlas preset
- architecture
- prerequisites
- installation
- development
- build
- scanning
- JSON index
- UI layout
- configuration / settings / presets
- troubleshooting

## Changelog

Maintain a concise changelog for significant user-visible changes.

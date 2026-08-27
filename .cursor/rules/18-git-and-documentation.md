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

Update documentation when:

- public configuration changes
- JSON schema changes
- setup changes
- commands change
- new metadata providers are added
- new visualization modes are added

## README

README should explain:

- project purpose
- architecture
- prerequisites
- installation
- development
- build
- scanning
- JSON index
- configuration
- presets
- troubleshooting

## Changelog

Maintain a concise changelog for significant user-visible changes.

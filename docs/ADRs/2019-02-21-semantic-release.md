# Semantic Release for Automated Versioning and Publishing

## Status

Accepted

## Context

Manual versioning and publishing is error-prone and creates bottlenecks. The CLI needed a way to automatically determine version bumps from commit messages and publish to npm without human intervention.

Semantic-release was adopted in February 2019 (PR #122, `config(ci): add semantic release`).

## Decision

Adopt [semantic-release](https://github.com/semantic-release/semantic-release) with the Angular commit convention. Configuration in `package.json`:

- **Release branches:** `main` (stable) and `beta` (pre-release channel)
- **Plugins:** commit-analyzer → release-notes-generator → npm → github (with binary assets)
- **Custom rules:** `{ "breaking": true, "release": "major" }` and `{ "type": "build", "scope": "deps", "release": "patch" }`

The version in `package.json` is `0.0.0-determined-by-semantic-release` — the actual version is determined at release time.

## Consequences

- Every merge to `main` that includes `feat:` or `fix:` commits triggers a release automatically
- Dependency bumps (`build(deps):`) trigger patch releases
- Breaking changes require `BREAKING CHANGE:` in the commit footer to trigger major releases
- Pre-release versions are available on the `beta` npm channel
- Contributors must follow the commit convention or releases won't be generated correctly

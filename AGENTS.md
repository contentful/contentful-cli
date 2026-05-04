# Agent Guide

Read this file first. It tells you where to find context in this repo.

## Quick Reference

| What you need | Where to look |
|---|---|
| How this repo is structured | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| How to build/test/run | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Why decisions were made | [docs/ADRs/](./docs/ADRs/) |
| What this repo does | [README.md](./README.md) |
| Per-command usage docs | [docs/](./docs/) |
| Active specs/work | [docs/specs/](./docs/specs/) |
| PR review rules | [.bito/guidelines/](./.bito/guidelines/) |
| CLI entrypoint | `bin/contentful.js` → `dist/lib/cli.js` |
| Command implementations | `lib/cmds/` and `lib/cmds/<parent>_cmds/` |
| Shared utilities | `lib/utils/` |
| Configuration handling | `lib/config.js` and `lib/context.js` |

## Sensitive Areas

These files/directories require extra caution when editing:

| Path | Why |
|---|---|
| `lib/context.js` | Resolves auth token, space ID, and environment from `.contentfulrc.json` — bugs here break every authenticated command |
| `lib/config.js` | Controls which commands skip auth/space-id checks — wrong entries cause silent auth bypass or false "not logged in" errors |
| `lib/cmds/login.js` | OAuth token flow — security-sensitive, handles token storage |
| `lib/utils/proxy.js` | HTTP proxy setup — incorrect changes can silently break all API calls for proxy users |
| `lib/cli.ts` | Top-level yargs setup and command registration — changes here affect every command |

## Sharp Edges & Invariants

- **Build before run.** The CLI requires `npm run tsc` before it can execute — `bin/contentful.js` requires `dist/lib/cli.js` which is compiled output.
- **Mixed JS/TS codebase.** Older commands are `.js`, newer ones are `.ts`. Both coexist via `allowJs: true`. Do not convert existing `.js` files to `.ts` without deliberate migration scope.
- **Yargs 13.x is pinned.** The CLI uses yargs ~13.3.2, which is significantly behind current (17.x). Do not upgrade without a dedicated migration effort — command definitions will break.
- **`ignore-scripts=true` in `.npmrc`.** After `npm ci`, you must run `npx allow-scripts` to let approved packages execute their install scripts. CI workflows already do this.
- **Unit tests need integration env vars.** Even unit tests require `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN` and `CLI_E2E_ORG_ID` to be set, due to a known coupling.
- **Commit convention is enforced by semantic-release.** A `feat:` commit triggers a minor release, `fix:` a patch. Breaking changes MUST include `BREAKING CHANGE:` in the commit footer — the `{ "breaking": true }` rule in `package.json` maps this to a major release.
- **Satellite packages must be version-aligned.** `contentful-migration`, `contentful-import`, `contentful-export`, and `contentful-batch-libs` are tightly coupled to the CMA.js version. Bumping one usually means bumping all of them.
- **`createPlainClient()` legacy mode.** Some call sites use the "legacy" deprecated CMA client mode as a transitional measure from the CMA v12 migration. These should be migrated over time but must not be removed without verifying the new API surface covers the use case.

## Key Conventions

- **Commit format:** Angular Conventional Commits (`type(scope): description`) via semantic-release
- **Branch strategy:** `main` (production) + `beta` (pre-release channel), squash merge
- **Test location:** `test/unit/` mirrors `lib/`, `test/integration/` uses talkback proxy, `test/e2e/` tests binaries
- **Module system:** CommonJS (compiled from TypeScript via `tsc`)
- **Command pattern:** Files in `lib/cmds/` export yargs command objects; subcommands go in `lib/cmds/<parent>_cmds/`

## Integration Points

**Upstream (this repo consumes):**
- **Contentful Management API** — all CRUD operations via `contentful-management.js` (^12.2.0)
- **contentful-migration** (^5.0.0) — migration script execution
- **contentful-import** (v10.0.0) / **contentful-export** (v8.0.0) — space import/export
- **contentful-batch-libs** (^11.0.0) — batch processing utilities
- **Contentful OAuth Page** — browser-based token acquisition during login

**Downstream (consumes this repo):**
- **Developers** — `npm install -g contentful-cli` or `npx contentful-cli`
- **CI/CD pipelines** — migration execution, environment management
- **Standalone binary users** — macOS/Linux/Windows binaries from GitHub releases

## Operational Model

This is a **CLI tool distributed via npm and standalone binaries**, not a running service. There are no dashboards, alerts, or deployment rollback procedures. When the Contentful Management API is unavailable, CLI commands fail with HTTP errors propagated to stderr. There is no retry logic or circuit breaking — the API client surfaces errors directly.

**Rollback** for a bad release means publishing a new patch version. Standalone binaries are attached to GitHub releases and can't be recalled, but npm versions can be deprecated via `npm deprecate`.

## Build & Quality

```bash
# Quick verification loop
npm ci && npx allow-scripts && npm run tsc && npm test
```

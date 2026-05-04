# Contributing

We appreciate any community contributions to this project, whether in the form of issues or Pull Requests.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 24 (see `.nvmrc`); >=22 supported | Use `nvm use` to switch automatically |
| npm | 10+ | Ships with Node.js 24 |

The `.npmrc` sets `ignore-scripts=true` to prevent post-install scripts from running automatically. After install, run `npx allow-scripts` to explicitly allow scripts from trusted packages (configured via `lavamoat` in `package.json`).

## Getting Started

```bash
# Clone and install
git clone git@github.com:contentful/contentful-cli.git
cd contentful-cli
npm ci
npx allow-scripts

# Build (compiles TypeScript to dist/)
npm run tsc

# Type-check without emitting (useful during development)
npx tsc --noEmit

# Run unit tests
npm run test:unit
```

> **Note on linting:** ESLint is configured (`.eslintrc.json`) but linting is not enforced in CI — the lint job is currently commented out in the GitHub Actions workflow. Pre-commit hooks run `prettier` and `lint-staged` on changed `.js` files only.

## Development Workflow

To avoid your development version colliding with a globally installed `contentful` binary, change the command name in `package.json`:

```diff
  "bin": {
-     "contentful": "bin/contentful.js"
+     "ctfl": "bin/contentful.js"
  }
```

Then link your local version:

```bash
npm link
```

You can also run commands directly from source without linking:

```bash
# Run any CLI command from the repo
node bin/contentful.js space list
node bin/contentful.js login
node bin/contentful.js content-type list --space-id <space-id>
```

> **This is a CLI, not a service.** There is no `npm start` or long-running process. To "run it locally," build with `npm run tsc` and then invoke commands via `node bin/contentful.js <command>` or via `npm link`.

### Watch mode

```bash
# Recompile on changes
npm run tsc:watch

# Run unit tests in watch mode
npm run test:unit:watch
```

## Testing

- **Framework:** Jest (v28) with Babel for TypeScript transpilation
- **Coverage:** nyc with 80% line coverage threshold
- **Unit tests:** `test/unit/` — mirrors `lib/` structure
- **Integration tests:** `test/integration/` — uses [talkback](https://github.com/ijpiantanida/talkback) proxy to record/playback HTTP requests
- **E2E tests:** `test/e2e/` — runs against standalone binaries on macOS and Linux

### Running tests

```bash
# Unit tests with coverage
npm test

# Unit tests without coverage
npm run test:unit

# Watch a specific test
npx jest test/unit/cmds/space_cmds/create.test.ts --watch

# Integration tests (starts talkback proxy automatically)
npm run test:integration

# E2E tests (requires build:standalone first)
npm run build:standalone
npm run test:e2e
```

### Integration test setup

Integration tests require environment variables from the Contentful Ecosystem Integration Test Org:

```bash
export CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN='<cma_auth_token>'
export CLI_E2E_ORG_ID='<organization_id>'
```

Unit tests also depend on these environment variables being set.

### Updating snapshots

Run tests without the talkback proxy to update snapshots:

```bash
npx jest test/integration/cmds/<path> --updateSnapshot
```

## Commit Convention

This repo uses [Angular JS Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit) via [semantic-release](https://github.com/semantic-release/semantic-release):

```
type(scope): description
```

Valid types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`

Examples:
```
feat(space): add environment alias management
fix(login): handle token expiration gracefully
chore: update dependencies
docs(merge): add usage examples
```

Pre-commit hooks (via husky) run prettier and lint-staged on changed `.js` files.

**Breaking changes:** Include `BREAKING CHANGE:` in the commit footer. The `release` config in `package.json` maps `{ "breaking": true }` to a major release, and `{ "type": "build", "scope": "deps" }` to a patch release.

## Branch Strategy

- `main` — production releases, auto-published via semantic-release
- `beta` — pre-release channel (`npm install contentful-cli@beta`)
- Feature branches — any naming convention, CI runs on all branches

## Release Process

Releases are fully automated via [semantic-release](https://github.com/semantic-release/semantic-release) on GitHub Actions:

1. Merge to `main` (or `beta` for pre-releases)
2. CI runs: build → check (unit + integration tests) → e2e tests
3. semantic-release analyzes commits, determines version bump
4. Publishes to npm, creates GitHub release with standalone binaries (macOS, Linux, Windows `.zip`)

Standalone binaries are built with `@yao-pkg/pkg` targeting Node 22 for macOS x64, Linux x64, and Windows x64.

## Adding a New Command

Use an existing simple command as a reference pattern. For a top-level command, see `lib/cmds/logout.js`. For a subcommand, see `lib/cmds/space_cmds/list.ts`.

Every command file exports a yargs command object with `command`, `desc`, `builder`, and `handler`. Subcommands go in `lib/cmds/<parent>_cmds/` and are auto-discovered via yargs `commandDir`.

If the command doesn't require authentication, add it to the `noAuthNeeded` array in `lib/config.js`. If it doesn't require a space ID, add it to `noSpaceIdNeeded`.

## Pull Requests

- All CI checks must pass (build, unit tests, integration tests, e2e tests)
- Squash merge to `main` is the standard workflow
- Dependabot PRs are auto-approved and merge-requested via workflow

## CI/CD

| Job | Trigger | What it does |
|---|---|---|
| Build | All pushes and PRs | Compiles TypeScript, builds standalone binaries, caches `dist/` and `build/` |
| Check | After build | Runs unit tests (with coverage) and integration tests (with talkback proxy) |
| E2E Tests | After build + check | Runs e2e tests against standalone binaries on ubuntu and macOS |
| Release | Push to `main` or `beta` | semantic-release: version bump, npm publish, GitHub release with binaries |
| CodeQL | Scheduled + PRs | Static analysis for security vulnerabilities |
| Dependabot Approve | Dependabot PRs | Auto-approves and requests merge for dependency updates |

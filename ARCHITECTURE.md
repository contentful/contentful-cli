# Architecture

How `contentful-cli` is put together. Aimed at someone about to change it —
contribution mechanics are in [CONTRIBUTING.md](./CONTRIBUTING.md), agent-specific
operating rules in [AGENTS.md](./AGENTS.md).

## Shape of the thing

A single Node.js binary entry point that resolves a command from the file tree,
builds a request context, and calls the Contentful Management API.

```
bin/contentful.js        →  requires dist/lib/cli.js (compiled output)
lib/cli.ts               →  yargs bootstrap: usage, commandDir, middleware, help
lib/cmds/**              →  the command tree (one module per command)
lib/utils/**             →  clients, logging, context helpers, assertions
lib/context.js           →  reads/writes ~/.contentfulrc.json
lib/config.js            →  which commands may skip auth / space id
lib/core/**              →  event system used by the longer-running commands
docs/**                  →  per-command reference docs, shipped in the package
```

`bin/contentful.js` is three lines: a shebang and
`require('../dist/lib/cli.js')`. Nothing runs from `lib/` directly — TypeScript
compiles `lib/**` to `dist/` (`tsconfig.json`, `outDir: ./dist`,
`module: commonjs`, `target: es2016`), so a source change is invisible until
`npm run tsc` has run.

## Command resolution

`lib/cli.ts` configures yargs and calls `.commandDir('cmds')`. Directory layout
is the routing table:

- `lib/cmds/<name>.{js,ts}` declares a top-level command and, in its `builder`,
  calls `.commandDir('<name>_cmds')` to pull in its subcommands.
- `lib/cmds/<name>_cmds/<sub>.{js,ts}` is a leaf: it exports `command`, `desc`,
  optional `aliases`, `builder` and `handler`.

Current top-level commands: `config`, `content-type`, `extension`, `feedback`,
`init`, `login`, `logout`, `merge`, `organization`, `space`, `sync`. The deepest
nesting is three levels — `space accesstoken`, `space alias`, `space environment`
and `space generate` each have their own `*_cmds` directory under
`lib/cmds/space_cmds/`. `organization_cmds` additionally carries two
non-command support trees, `security_checks/` (the checks behind
`organization sec-check`) and `taxonomy/`.

Global flags come from `lib/cli.ts`: `-h/--help`, `-v/--version`. `.strict()`
and `.recommendCommands()` are on, so an unknown flag is an error rather than
being passed through, and `.fail()` prints help plus the message and exits 1.

## Middleware: context before handlers

Three yargs middlewares in `lib/utils/middlewares.js` run before every handler,
in order:

1. `getCommand` — joins `yargs.getContext().fullCommands` into a command string
   like `"space use"`.
2. `buildContext` — loads persisted config via `lib/context.js`, then layers CLI
   flags on top: `managementToken`, `spaceId`/`activeSpaceId`,
   `environmentId`/`activeEnvironmentId`, `host`, `insecure`, `proxy`,
   `rawProxy`. Defaults `activeEnvironmentId` to `master` and `host` to
   `api.contentful.com`.
3. `assertContext` — consults `lib/config.js`. If the command string is not in
   `noAuthNeeded` it must be logged in; if not in `noSpaceIdNeeded` it must have
   an active space. This is why adding a command that legitimately runs without
   a space requires editing `lib/config.js`.

Handlers therefore receive a `context` object and should not re-read config
themselves.

### Persisted configuration

`lib/context.js` resolves the config file as: `CONTENTFUL_CONFIG_FILE` env
override → nearest `.contentfulrc.json` found by walking up from cwd
(`find-up`) → `~/.contentfulrc.json`. Proxy settings are also read from
`https_proxy`/`http_proxy` (either case), and those env keys are deleted after
being parsed so `axios` cannot pick them up independently.

## API access

All CMA access funnels through `lib/utils/contentful-clients.js`, which exposes
two factories over `contentful-management`:

- `createManagementClient` → `createClient(..., { type: 'legacy' })`, the
  resource-object API most commands use.
- `createPlainClient` → `createClient(..., { type: 'plain' })` for the
  endpoint-style API.

Both inject the proxy agent (or raw proxy), `host`, `insecure`, and
`application: contentful.cli/<version>`. Commands should not construct clients
any other way — the user agent and proxy behaviour depend on going through here.

Heavier operations delegate to sibling libraries rather than reimplementing
them: `contentful-export`, `contentful-import`, `contentful-migration` and
`contentful-batch-libs` are runtime dependencies, and `space export`,
`space import`, `space migration` and the `organization` import/export commands
are thin wrappers over them.

## Event system

`lib/core/` holds an RxJS-backed event bus (`lib/core/events/index.js`) with
`ERROR` / `MESSAGE` / `INTENT` event types, a `MessageDispatcher` scoped per
subsystem, and two handler trees under `lib/core/event-handlers/`: `logging/`
renders events to the terminal, `intents/` answers events that need a decision.
This lets a multi-step flow emit progress and prompts from deep inside itself
without threading a logger through every call.

Its only consumer today is `lib/cmds/space_cmds/create.ts`, which constructs
`new EventSystem()` and attaches the two `create-space-handler` modules directly
rather than going through the `createEventSystem` helper in
`lib/core/events/create-event-system.js` — that helper currently has no callers
outside `lib/core/`.

## Testing tiers

`jest.config.js` transpiles both JS and TS through `babel-jest`
(`babel.config.js` = `preset-env` targeting current node + `preset-typescript`),
so tests run from source, not from `dist/`.

| Tier | Path | How it gets its data |
| --- | --- | --- |
| Unit | `test/unit/**` | mocks, mirroring the `lib/cmds` and `lib/utils` layout |
| Integration | `test/integration/**` | drives the CLI with `nixt`, HTTP replayed by `talkback` from `recordings/*.json5` |
| E2E | `test/e2e/**` | `execa` against the packaged binary in `build/` |

`test/proxy.js` starts talkback on port 3333 pointed at `./recordings`, with a
custom `bodyMatcher` that matches `create-space` tapes on the space name, and an
`ignoreHeaders` list that keeps `authorization` and user-agent headers out of
recorded tapes. `npm run test:integration` uses `concurrently` to run the proxy
and jest together with `--success first --kill-others`.

## Build and release

Two build outputs from one source tree:

1. **npm package** — `npm run tsc` produces `dist/`; `package.json` `files`
   ships `dist`, `bin`, `output`, `lib`, `docs`, `version.js` and `README.md`,
   with `bin.contentful` → `bin/contentful.js`.
2. **Standalone binaries** — `npm run build:standalone` runs `tsc` then
   `@yao-pkg/pkg`, targeting `node22-{macos,linux,win}-x64` into `build/`
   (`package.json` → `pkg`). It bundles two assets that cannot be statically
   resolved: figlet's `Standard.flf` font and `axios`'s node CJS build.
   `npm run build:package` then runs `script/package`, a small jszip script that
   wraps each binary as `contentful-cli-<platform>-<version>.zip`.

CI is GitHub Actions, orchestrated by `.github/workflows/main.yaml` on pushes to
`main`/`beta`/`exo` and on all PRs:

```
build (build.yaml)  →  check (check.yaml)  →  e2e-tests (test-e2e.yaml)  →  release (release.yaml)
```

`build.yaml` runs `npm ci && npx allow-scripts && npm run build:package` and
caches `dist` + `build` under a run-scoped key; the later jobs restore that
cache with `fail-on-cache-miss: true` rather than rebuilding. `check.yaml` runs
unit and integration tests — note that its lint and format steps are currently
commented out, so `npm run lint` is not enforced by CI. E2E runs on a
`ubuntu-latest` + `macos-latest` matrix with `max-parallel: 1`. Integration and
E2E jobs are skipped for PRs from forks, because they need org secrets.
`codeql.yaml` scans the workflow files themselves on pushes touching
`.github/workflows/**`.

`release.yaml` runs only on pushes to `main` or `beta`. It fetches a GitHub
token from HashiCorp Vault via JWT auth (no long-lived token in repo secrets),
commits as `contentful-automation[bot]`, and runs `semantic-release`.
`package.json` → `release` defines three branches: `main` (stable), `beta`
(prerelease on the `beta` channel) and `exo` (prerelease on the `exo` channel).
Plugins publish to npm and attach the three platform zips to the GitHub release.
`releaseRules` add `build(deps)` → patch on top of the defaults, so dependency
bumps ship as releases.

## Things worth knowing before you change something

- `yargs` is pinned to `~13.3.2` while upstream is several majors ahead. The
  `commandDir` routing and `getContext().fullCommands` used by `getCommand`
  are the pieces that would need rework to move off it.
- `lib/` is roughly half TypeScript and half JavaScript (53 `.ts` / 67 `.js` at
  the time of writing) with `allowJs: true`. That is a migration in progress,
  not an accident.
- `npm install` does not run lifecycle scripts (`.npmrc`), so husky hooks are
  not installed until `npx allow-scripts` runs. See
  [docs/ADRs/2026-08-25-disable-npm-install-scripts-by-default.md](./docs/ADRs/2026-08-25-disable-npm-install-scripts-by-default.md).
- `catalog-info.yaml` still carries CircleCI annotations and the README a
  CircleCI badge, but CI runs on GitHub Actions.

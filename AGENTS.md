# AGENTS.md

Operating notes for coding agents working in `contentful-cli`. Read this before
changing anything. For how the pieces fit together see
[ARCHITECTURE.md](./ARCHITECTURE.md); for commit conventions and the human
contribution flow see [CONTRIBUTING.md](./CONTRIBUTING.md).

## What this repo is

The `contentful` command line tool, published to npm as `contentful-cli` and
also shipped as standalone binaries for macOS, Linux and Windows. It is a
[yargs](https://yargs.js.org) CLI written in a mix of TypeScript and JavaScript
that talks to the Contentful Management API through `contentful-management`.

Owner: `@contentful/team-developer-experience` (see `.github/CODEOWNERS` and
`catalog-info.yaml`).

## Setup

```sh
npm install
```

`.npmrc` sets `ignore-scripts=true`, so lifecycle scripts do **not** run on
install. If you need them (husky hooks, the `pkg` build's esbuild), run:

```sh
npx allow-scripts
```

The allowlist lives under the `lavamoat.allowScripts` key in `package.json`.
Adding a dependency that needs an install script means adding it there too.
See [docs/ADRs/2026-08-25-disable-npm-install-scripts-by-default.md](./docs/ADRs/2026-08-25-disable-npm-install-scripts-by-default.md).

Node: `>=22` per `package.json` `engines`; `.nvmrc` pins `24`, which is also the
version CI uses.

## Commands you will actually need

| Task | Command |
| --- | --- |
| Type-check / compile to `dist/` | `npm run tsc` |
| Lint | `npm run lint` (eslint over `bin lib test`) |
| Format | `npm run prettier:write` |
| Unit tests | `npm run test:unit` |
| Unit tests, single path | `npx jest test/unit/cmds/space --verbose` |
| Unit tests with coverage (the default `npm test`) | `npm run test:coverage` |
| Standalone binaries | `npm run build:standalone` |
| Binaries + zipped release artifacts | `npm run build:package` |
| Integration tests | `npm run test:integration` |
| E2E tests (needs a built binary) | `npm run test:e2e` |

`nyc` enforces 80% line coverage (`package.json` → `nyc.check-coverage`), so
`npm test` fails if your change drops coverage below that.

## Tests need credentials — know which ones you can run

- **Unit tests** (`test/unit/**`) are the only tier you can rely on without
  Contentful credentials, and even there `CONTRIBUTING.md` notes some currently
  read the integration env vars.
- **Integration tests** (`test/integration/**`) run against the `talkback`
  proxy in `test/proxy.js`, replaying the HTTP tapes in `recordings/`. Recording
  new tapes requires `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN` and
  `CLI_E2E_ORG_ID` for the Ecosystem integration-test org.
- **E2E tests** (`test/e2e/**`) shell out to the packaged binary in `build/`, so
  `npm run build:standalone` must have run first.

If you do not have those secrets, say so rather than reporting a test tier as
passing. Never commit a token into `recordings/`, a snapshot, or a fixture —
`test/proxy.js` strips `authorization` and `x-contentful-user-agent` headers
from tapes, and that guarantee only holds if you leave it alone.

## Adding or changing a command

Commands are discovered by yargs `commandDir`, so file placement *is* the
routing — there is no central registry to update.

1. A top-level command is a module in `lib/cmds/` exporting `command`, `desc`
   and a `builder` that calls `.commandDir('<name>_cmds')` (see
   `lib/cmds/space.js`).
2. A subcommand is a file in the matching `lib/cmds/<name>_cmds/` directory
   exporting `command`, `desc`, optional `aliases`, `builder`, and `handler`.
   Wrap the handler in `handleAsyncError` from `lib/utils/async.ts` so failures
   surface as CLI errors rather than unhandled rejections — `lib/cmds/space_cmds/use.ts`
   is the reference implementation.
3. Build API clients with `createManagementClient` / `createPlainClient` from
   `lib/utils/contentful-clients.js`. Do not call `contentful-management`'s
   `createClient` directly; the wrappers apply proxy config, `host`, `insecure`
   and the `contentful.cli/<version>` application header.
4. If the command works without a login or without an active space, add its
   full command string (e.g. `'space use'`) to `noAuthNeeded` /
   `noSpaceIdNeeded` in `lib/config.js`. Otherwise the `assertContext`
   middleware will reject it.
5. Add or update the matching page under `docs/<command>/` — `docs/README.md`
   indexes the command tree and the `docs` directory is shipped in the npm
   package (`package.json` → `files`).

New code should be TypeScript. The repo is mid-migration (`allowJs: true` in
`tsconfig.json`, roughly half the files still `.js`); do not bulk-convert
existing JavaScript as a side effect of an unrelated change.

## Conventions to respect

- Commit messages follow the Angular convention and drive semantic-release.
  `feat` and `fix` on `main` cut a release; use `docs`, `chore`, `test`, `refactor`
  or `style` when you do not want one. `build(deps)` is configured to release a
  patch, so it is not a safe "no release" type here.
- Prettier config is `.prettierrc`; eslint extends `eslint:recommended`,
  `prettier` and `plugin:@typescript-eslint/recommended`.
- User-facing output goes through `lib/utils/log.js` and the helpers in
  `lib/utils/styles.js` / `lib/utils/emojis.js`, not bare `console.log`.

## Do not

- Do not weaken `.npmrc` or `.gitignore`.
- Do not commit `dist/`, `build/` or `output/` — all three are gitignored build
  output.
- Do not hand-edit `package.json`'s `version`; it is
  `0.0.0-determined-by-semantic-release` and set at publish time.
- Do not add reviewers or merge on your own behalf.

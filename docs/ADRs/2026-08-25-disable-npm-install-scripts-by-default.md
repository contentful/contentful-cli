# Disable npm install scripts by default, re-enable them from an allowlist

- **Date:** 2026-08-25
- **Status:** Accepted (in effect since 2025-12-02)

> This record was written on 2026-08-25 from the commit history. It documents an
> existing decision rather than a new one; the rationale below is reconstructed
> from the commits and the resulting configuration, not from a contemporaneous
> design discussion.

## Context

`contentful-cli` installs a large dependency tree — at the time of writing, 41
runtime dependencies and 40 dev dependencies, several of which (`contentful-export`,
`contentful-import`, `contentful-migration`, `semantic-release`) pull in deep
trees of their own. By default npm executes arbitrary `preinstall`/`install`/
`postinstall` scripts from every package in that tree, on developer machines and
in CI, including the CI job that holds a publish token.

Only a small number of packages here actually need an install script: `husky`
(installs the git hooks), a transitive `spawn-sync` under
`inquirer-select-directory`, and later `esbuild` beneath `@yao-pkg/pkg` for the
standalone binary build.

Two commits put the current arrangement in place:

- `f65855d8eb7f4cd50a2e32cadbb7bae39a95f240` — *chore: [] ignore npm scripts (#3172)*,
  2025-11-26. Adds `.npmrc` containing `ignore-scripts=true`, and removes the
  line that had been keeping `.npmrc` out of version control in `.gitignore`.
- `d8998ec7345d7cebcae1c3203487fc79b3484688` — *chore: permissions updated (#3181)*,
  2025-12-02. Adds `@lavamoat/allow-scripts` as a dev dependency and a
  `lavamoat.allowScripts` block to `package.json`, and adds `npx allow-scripts`
  after `npm ci` in `build.yaml`, `check.yaml`, `release.yaml` and
  `test-e2e.yaml`. The same PR tightened the `permissions:` blocks on those
  workflows.

Blanket `ignore-scripts=true` on its own would have broken the husky hooks and
the `pkg` build, so the allowlist is what makes the first commit workable.

## Decision

Install scripts are off globally via a committed `.npmrc`
(`ignore-scripts=true`). The packages that genuinely need one are enumerated in
`package.json` under `lavamoat.allowScripts` and run explicitly with
`npx allow-scripts`, which is invoked as its own step after `npm ci` in every
CI workflow.

The current allowlist is:

```json
"lavamoat": {
  "allowScripts": {
    "$root$": true,
    "husky": true,
    "inquirer-select-directory>inquirer>external-editor>spawn-sync": true,
    "@yao-pkg/pkg>esbuild": true
  }
}
```

Entries are written as full dependency paths, so allowing a package in one
position does not allow it everywhere it appears in the tree.

## Consequences

- A plain `npm install` leaves husky's git hooks uninstalled. The `precommit`
  and `prepush` scripts in `package.json` therefore do not fire until someone
  runs `npx allow-scripts`. This is the most common surprise for a new
  contributor or an automated agent working in the repo.
- Adding a dependency that needs an install script is a two-part change:
  the dependency, plus its full path in `lavamoat.allowScripts`. Without the
  second part it silently does not run its script.
- A dependency that starts requiring an install script after a version bump will
  fail quietly rather than loudly. `@lavamoat/allow-scripts` reports packages
  with scripts that are neither allowed nor explicitly denied, but nothing in
  CI currently fails a build on that report.
- CI gains a step that must be kept in the four workflows that install
  dependencies. A new workflow that runs `npm ci` without `npx allow-scripts`
  will not be able to run the standalone binary build.
- In exchange, no third-party install script executes in the release job that
  holds the npm publish credentials unless it has been explicitly listed here.

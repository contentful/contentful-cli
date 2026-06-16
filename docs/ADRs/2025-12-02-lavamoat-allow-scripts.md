# LavaMoat allow-scripts for Supply Chain Security

## Status

Accepted

## Context

npm packages can run arbitrary scripts during installation (`postinstall`, `preinstall`, etc.), creating a supply chain attack vector. The `.npmrc` setting `ignore-scripts=true` blocks all install scripts, but some legitimate packages (like `husky` for git hooks and `@yao-pkg/pkg`'s esbuild dependency) require their install scripts to function.

## Decision

Use `@lavamoat/allow-scripts` to selectively permit install scripts from trusted packages while blocking all others. The allowlist is configured in `package.json` under `lavamoat.allowScripts`:

- `$root$` — the project's own scripts
- `husky` — git hook setup
- `inquirer-select-directory>inquirer>external-editor>spawn-sync` — required for interactive directory selection
- `@yao-pkg/pkg>esbuild` — binary compilation tooling

After `npm ci` (which honors `ignore-scripts=true`), `npx allow-scripts` is run to execute only the approved scripts.

## Consequences

- All CI workflows and local setup must run `npx allow-scripts` after `npm ci`
- New dependencies that require install scripts must be explicitly added to the allowlist
- Reduces the risk of supply chain attacks via malicious install scripts

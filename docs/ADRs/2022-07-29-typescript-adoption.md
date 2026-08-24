# TypeScript Adoption

## Status

Accepted

## Context

The CLI was originally written entirely in JavaScript. As the codebase grew and more contributors worked on it, the lack of type safety led to regressions and made refactoring risky. The broader Contentful SDK ecosystem was also moving toward TypeScript.

The migration was incremental — new files were written in TypeScript while existing JavaScript files were left in place, allowing both to coexist via `allowJs: true` in `tsconfig.json`.

## Decision

Adopt TypeScript with an incremental migration strategy (PR #1570, `feat: init typescript`). Key choices:

- **Target:** ES2016 (aligned with Node.js LTS support at the time)
- **Module system:** CommonJS (`"module": "commonjs"`) to avoid breaking the existing `require()`-based codebase
- **`allowJs: true`:** Enables gradual migration — `.js` and `.ts` files coexist
- **`strict: true`:** Enforced from the start for new TypeScript files
- **Compilation:** `tsc` compiles `lib/` → `dist/`, `bin/contentful.js` requires `dist/lib/cli.js`

Babel + `@babel/preset-typescript` is used in the Jest test configuration for transpilation during testing.

## Consequences

- New commands and utilities are written in TypeScript (e.g., `login.ts`, `merge.ts`, `organization.ts`, `space_cmds/create.ts`)
- Many older files remain as `.js` (e.g., `config.js`, `context.js`, most extension commands)
- The mixed codebase means contributors must be comfortable with both `.js` and `.ts`
- The build step (`npm run tsc`) is required before running the CLI from source

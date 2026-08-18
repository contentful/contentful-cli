# Migration from pkg to @yao-pkg/pkg for Standalone Binaries

## Status

Accepted

## Context

The CLI is distributed both as an npm package and as standalone binaries for macOS, Linux, and Windows. These binaries are built by bundling the Node.js runtime with the compiled CLI code.

The original `pkg` package by Vercel was deprecated and unmaintained. `@yao-pkg/pkg` is a community fork that continues maintenance and supports newer Node.js versions (the CLI targets Node 22).

## Decision

Migrate from `pkg` to `@yao-pkg/pkg` (commit `feat(ci) migrate pkg to yao-pkg to create linux/window/mac executables`, 2026-04-10).

Build targets in `package.json`:
- `node22-macos-x64`
- `node22-linux-x64`
- `node22-win-x64`

Assets bundled: `figlet` fonts and `axios` CJS bundle (required for proper bundling).

## Consequences

- Standalone binaries can target Node 22, matching the runtime requirement
- Binary artifacts are attached to GitHub releases as `.zip` files (macOS, Linux, Windows)
- E2E tests validate the binaries work correctly on ubuntu and macOS runners
- ARM/Apple Silicon macOS binaries are not built — macOS x64 runs via Rosetta 2

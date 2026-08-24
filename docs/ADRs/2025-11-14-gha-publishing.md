# Migration to GitHub Actions for CI/CD and Publishing

## Status

Accepted

## Context

The CLI historically used CircleCI for CI/CD (visible in the README badge). As Contentful standardized on GitHub Actions across the organization, the CLI needed to migrate its build, test, and release pipelines.

This migration was tracked under DX-535.

## Decision

Migrate all CI/CD to GitHub Actions (PR #3160, `chore: migrate to gha publishing`). The pipeline was structured as reusable workflow calls:

- `main.yaml` — orchestrator: triggers build → check → e2e → release
- `build.yaml` — compiles TypeScript, builds standalone binaries, caches artifacts
- `check.yaml` — unit tests + integration tests (with talkback proxy)
- `test-e2e.yaml` — runs e2e tests against standalone binaries on ubuntu and macOS (matrix, `max-parallel: 1`)
- `release.yaml` — semantic-release with Vault-sourced credentials (`contentful-automation[bot]`)

Secrets are retrieved from HashiCorp Vault at runtime rather than stored as GitHub Secrets, following Contentful's security practices.

## Consequences

- CircleCI is fully decommissioned for this repo (badge in README is now stale)
- Build artifacts are shared between jobs via `actions/cache` with a run-specific key
- Release requires `contents: write` and `id-token: write` permissions for Vault JWT auth
- E2E tests run on both ubuntu and macOS to validate standalone binaries across platforms
- Linting and formatting checks are currently commented out in the check workflow

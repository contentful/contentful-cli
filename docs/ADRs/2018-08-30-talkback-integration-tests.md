# Talkback Proxy for Integration Tests

## Status

Accepted

## Context

Integration tests need to exercise real CLI commands against the Contentful API, but hitting the API directly in CI is slow, flaky, and requires credentials. The tests needed a way to record and replay HTTP interactions deterministically.

Talkback was introduced in August 2018 (`test(integration): Add recordings for integration tests`).

## Decision

Use [talkback](https://github.com/ijpiantanida/talkback) as an HTTP proxy that records API responses as "tapes" and replays them on subsequent runs. The proxy runs alongside tests via `concurrently`:

```bash
npm run test:integration  # starts talkback-proxy + jest concurrently
```

The proxy is configured in `test/proxy.js` and recorded interactions are stored alongside the test files.

## Consequences

- Integration tests are fast and deterministic in CI — no real API calls needed
- New integration tests may need fresh recordings when API responses change
- Updating snapshots requires running tests without recordings first, then re-recording
- Unit tests still depend on integration test environment variables being set (a known coupling)
- E2E tests (separate from integration tests) run against real standalone binaries and may hit the API
- Recorded tapes may contain non-credential identifiers from API responses (space IDs, environment IDs, user metadata) — recordings should only be made against the dedicated integration test org, never against orgs with real customer data

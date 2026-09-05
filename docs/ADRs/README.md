# Architectural Decision Records

Records of decisions this repository has actually made, newest first.

- [2026-09-05 — Use an opt-in hybrid path for bulk entry imports](./2026-09-05-bulk-entry-operations-space-import-poc.md) — why the PoC keeps non-entry imports on `contentful-import`, batches entry writes and publishing separately, and fails explicitly when the Premium entitlement is unavailable.
- [2026-08-25 — Disable npm install scripts by default, re-enable them from an allowlist](./2026-08-25-disable-npm-install-scripts-by-default.md) — why `.npmrc` sets `ignore-scripts=true` and CI runs `npx allow-scripts`.

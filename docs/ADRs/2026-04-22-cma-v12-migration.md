# CMA.js v12 Migration and Node.js 22+ Requirement

## Status

Accepted

## Context

`contentful-management.js` (CMA.js) v12 was a major release that modernized the SDK. The CLI needed to upgrade to stay compatible with the latest API features and to align with the broader SDK ecosystem's migration tracked under DX-780 and DX-689.

CMA.js v12 introduced breaking changes including removal of deprecated methods, changes to `createPlainClient()`, and updated type exports (e.g., `CursorPaginatedCollectionProp` moved). These changes cascaded through the CLI's satellite packages — `contentful-migration` (v5), `contentful-import` (v10), `contentful-export` (v8), and `contentful-batch-libs` (v11) all needed coordinated major bumps.

## Decision

Ship the CMA v12 migration as a single breaking change (PR #3193, `feat!: update to CMA.js v12 and drop support for Node < 22`). This:

- Bumped `contentful-management` to ^12.2.0
- Updated `contentful-migration` to v5.0.0, `contentful-import` to v10.0.0, `contentful-export` to v8.0.0, `contentful-batch-libs` to v11.0.0
- Dropped Node.js support below v22 (`engines.node: ">=22"`)
- Migrated `createPlainClient()` to explicitly use the "legacy" deprecated CMA where needed
- Updated deep imports that moved in v12 (e.g., `CursorPaginatedCollectionProp`)
- Added `{ "breaking": true, "release": "major" }` to semantic-release config to correctly trigger major version bumps

This resulted in `contentful-cli` v4.0.0.

## Consequences

- Users on Node.js < 22 must upgrade before using CLI v4+
- All satellite packages are now on their latest majors, aligned with CMA.js v12
- CI builds and standalone binaries target Node 22/24
- Some `createPlainClient()` call sites use the "legacy" mode as a transitional measure — these should be migrated to the new API surface over time

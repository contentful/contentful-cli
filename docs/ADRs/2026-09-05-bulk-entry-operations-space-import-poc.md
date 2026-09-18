# Use an opt-in hybrid path for bulk entry imports

- **Date:** 2026-09-05
- **Status:** Proposed (proof of concept)
- **Issue:** [#3331](https://github.com/contentful/contentful-cli/issues/3331)

## Context

`contentful space import` delegates to `contentful-import`. That importer uses
the classic Content Management API workflow, which creates, updates and
publishes entries individually. The request rate makes restoring exports with
100,000 or more entries prohibitively slow.

Contentful's Bulk Entry Operations API can create or update up to 10,000 entries
in one asynchronous job. The existing Bulk Actions API can publish up to 200
entities in one asynchronous action. These APIs can substantially reduce the
number of requests needed for the entry portion of a restore, but they do not
replace the complete import workflow:

- content models, locales, tags, editor interfaces and assets still need the
  existing importer;
- create and update use different bulk endpoints and update payloads require the
  current destination version;
- publication state must be reconstructed from the export;
- Bulk Entry Operations requires the Bulk Content Operations entitlement;
- at most one Bulk Entry Operation may be in flight per space;
- Bulk Actions and locale-based publishing have separate behavior and limits.

Environment cloning is not an alternative for this use case. A restore may come
from a historical JSON backup after the source environment has been deleted, or
the JSON may have been transformed to repair cross-space resource links.

## Decision

Add an explicit `--use-bulk-entries` option to `contentful space import`. The
option defaults to `false`; the established import path remains unchanged unless
the caller opts in.

When the option is enabled, the command uses a hybrid, two-phase import:

1. Read the export JSON and pass a copy with `entries: []` to
   `contentful-import`. This imports content models, locales, tags, editor
   interfaces and assets using the existing implementation.
2. Import the original `entries` array through a dedicated bulk transport built
   on the repository's `createPlainClient` wrapper.

The bulk entry phase makes the following choices.

### Create and update partitioning

List destination entry IDs and versions before writing. An entry absent from the
destination is sent to `bulk_operations/entries/create`; an existing entry is
sent to `bulk_operations/entries/update` with the destination's current
`sys.version`.

Source environment metadata is not copied. Bulk payloads retain the entry ID,
content type link, fields and metadata. Every imported entry must have a
`sys.id`, because preserving IDs is required for links and for later selective
publishing.

`--skip-content-updates` removes existing entries from the update set while
still allowing new entries to be created.

### Uploads and job execution

Serialize each batch as a JSON array and upload it through the environment-scoped
Upload API using `application/octet-stream`. Each create or update batch contains
at most 10,000 entries.

Run jobs sequentially. This follows the platform restriction that only one Bulk
Entry Operation may be active in a space at a time and avoids adding a separate
conflict/retry scheduler to the PoC.

Poll every asynchronous operation until it completes, fails or reaches the
configured timeout. Inspect `result.items` after a completed job because a job
may complete while individual entries fail.

### Publication

An entry is selected for publication only when the export contains a numeric
`sys.publishedVersion`. Draft entries are imported but remain unpublished.
`--skip-content-publishing` disables this phase.

Publish selected entries through Bulk Actions in batches of at most 200. Bulk
Entry Operation results identify successful entries but do not guarantee a
returned version. The PoC therefore derives the post-write version as follows:

- create: version `1`;
- update: destination version plus `1`;
- if the operation result provides a version, use that value instead.

Only entries successfully written by this invocation are eligible for
publication.

### Entitlement and failure behavior

Do not silently fall back to classic entry import when the bulk endpoint returns
`403`. Report that Bulk Content Operations is required. A silent fallback would
make a command chosen for predictable restore performance unexpectedly return to
the slow path.

This means the import is not transactional. The classic phase may have imported
content models and other entities before the bulk phase discovers a missing
entitlement or another failure. Re-running the command is expected to reconcile
existing entities through normal create-versus-update partitioning.

`--content-model-only` bypasses the bulk path entirely. Existing options retain
their established meaning.

## Alternatives considered

### Replace the classic importer completely

Rejected for the PoC. Bulk Entry Operations only addresses entries; rebuilding
locale, content model, editor interface, tag and asset behavior would duplicate
`contentful-import` and increase compatibility risk.

### Enable bulk operations automatically

Rejected. Availability depends on a Premium entitlement, and changing the
default would break imports for spaces without it. Opt-in behavior also limits
the blast radius while the API integration is evaluated.

### Fall back automatically after a `403`

Rejected. The classic phase has already run at that point, and silently importing
entries one by one could take hours on the large restores this option targets.
An actionable failure is more predictable.

### Implement the optimization only in `contentful-import`

Deferred. That may be the better long-term ownership boundary because other
consumers would benefit, but a CLI-level PoC can validate API compatibility and
operational behavior without first changing the sibling package.

### Use environment cloning

Rejected for backup restore and transformed cross-space imports, where no live
source environment exists or the payload must be rewritten before import.

## Consequences

- Large entry restores can reduce CMA request volume by several orders of
  magnitude when the space has Bulk Content Operations enabled.
- Users must explicitly choose `--use-bulk-entries` and must verify entitlement
  before relying on it for a restore.
- Non-entry entities retain the mature behavior of `contentful-import`.
- The command performs an additional destination-wide entry listing to decide
  between create and update.
- Create and update jobs are serialized, favoring API compatibility over maximum
  concurrency.
- Partial imports remain possible. There is no rollback across the classic and
  bulk phases or across individual bulk jobs.
- Publishing restores entry-level published versus draft state, but locale-based
  publishing remains a separate problem and is outside this PoC.
- Assets and archived entries are not moved to a new bulk implementation.
- The CLI now owns orchestration logic that may eventually belong in
  `contentful-import`.

## Validation and graduation criteria

The PoC includes unit coverage for batching, payload preparation, destination
version partitioning, polling, item-level failures, raw and SDK transport paths,
entitlement errors and selective publication. The new helper and all executable
lines added by the change have 100% statement, branch and function coverage. The
TypeScript build and standalone macOS, Linux and Windows packaging complete
successfully.

A real import against a space without Bulk Content Operations confirmed the
expected `403` entitlement response after the classic phase. Before changing the
option from opt-in or marking this decision Accepted, validate against an
entitled space with representative data and confirm:

- create and update jobs at multiple batch boundaries;
- circular and cross-space links;
- partial item failures and safe reruns;
- published and draft entries, including locale-based publishing expectations;
- large exports under upload-size and timeout limits;
- operational guidance for detecting entitlement before starting the classic
  phase, or an API-supported preflight check.

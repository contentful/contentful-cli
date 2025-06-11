# `contentful sync region`

Sync a space between Contentful regions (e.g., from North America to Europe).

This command exports content (and optionally taxonomies if used at an Organisation level) from a source space in one region and imports it into a target space in another.

---

## Usage

```bash
contentful region migrate \
  --source-region na \
  --target-region eu \
  --source-space-id <source-space-id> \
  --target-space-id <target-space-id> \
  --source-token <source-cma-token> \
  --target-token <target-cma-token> \
  --include-taxonomies <true or false> \
  --source-org-id <source-org-id> \
  --target-org-id <target-org-id> \
  --skip-content-publishing <true or false>

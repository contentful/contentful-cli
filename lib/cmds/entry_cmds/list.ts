import { createCommand } from '../../utils/command-factory'
import type { EntryLike, QueryParams } from '../../utils/contentful-types'

const { command, desc, builder, handler } = createCommand({
  command: 'list',
  desc: 'List entries',
  feature: 'entry-list',
  usage: 'Usage: contentful entry list [options]',
  examples: [
    [
      'contentful entry list --content-type blogPost',
      'List all blog post entries'
    ],
    [
      'contentful entry list --content-type blogPost --quiet',
      'Output only entry IDs (one per line, for piping)'
    ],
    [
      'contentful entry list --json --limit 10',
      'Get first 10 entries as JSON array'
    ],
    [
      'contentful entry list --ct blogPost -q | xargs -I{} contentful entry unpublish {}',
      'Unpublish all entries of a type'
    ]
  ],
  options: {
    'content-type': {
      alias: 'ct',
      type: 'string',
      describe: 'Filter by content type ID'
    },
    query: {
      type: 'string',
      describe: 'Additional CMA query params (key=value pairs)'
    },
    limit: {
      alias: 'l',
      type: 'number',
      describe: 'Results per page (default: 100, max: 1000)'
    },
    skip: {
      type: 'number',
      describe: 'Offset for pagination'
    }
  },
  handler: async (client, argv) => {
    const query: QueryParams = {}
    if (argv.contentType) query.content_type = argv.contentType
    if (argv.limit) query.limit = argv.limit
    if (argv.skip) query.skip = argv.skip

    return client.entry.getMany({ query })
  },
  tableFormat: data => ({
    head: ['ID', 'Content Type', 'Status', 'Updated At'],
    rows: data.items.map((entry: EntryLike) => [
      entry.sys.id,
      entry.sys.contentType?.sys?.id || '-',
      getEntryStatus(entry),
      entry.sys.updatedAt || '-'
    ])
  }),
  quietExtractor: data => data.items.map((e: EntryLike) => e.sys.id)
})

function getEntryStatus(entry: EntryLike): string {
  if (entry.sys.archivedVersion) return 'archived'
  if (entry.sys.publishedVersion) {
    if (entry.sys.version > entry.sys.publishedVersion + 1) return 'changed'
    return 'published'
  }
  return 'draft'
}

export { command, desc, builder, handler }

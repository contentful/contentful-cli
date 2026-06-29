import { createCommand } from '../../utils/command-factory'
import { validateId } from '../../utils/validators'
import type { EntryLike } from '../../utils/contentful-types'

const { command, desc, builder, handler } = createCommand({
  command: 'get <id>',
  desc: 'Get a single entry',
  feature: 'entry-get',
  usage: 'Usage: contentful entry get <id> [options]',
  examples: [
    ['contentful entry get 5KsDBWseXY6QegucYAoacS', 'Get entry as a table'],
    [
      'contentful entry get 5KsDBWseXY6QegucYAoacS --json',
      'Get full entry JSON (includes sys, fields, metadata)'
    ],
    [
      'contentful entry get 5KsDBWseXY6QegucYAoacS --json --environment-id staging',
      'Get entry from a specific environment'
    ]
  ],
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    return client.entry.get({ entryId: id })
  },
  tableFormat: entry => ({
    rows: [
      ['ID', entry.sys.id],
      ['Content Type', entry.sys.contentType?.sys?.id || '-'],
      ['Version', String(entry.sys.version)],
      ['Status', getEntryStatus(entry)],
      ['Updated At', entry.sys.updatedAt || '-']
    ]
  }),
  quietExtractor: entry => [entry.sys.id]
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

import {createCommand} from '../../utils/command-factory'

const {command, desc, builder, handler} = createCommand({
  command: 'list',
  desc: 'List entries',
  feature: 'entry-list',
  usage: 'Usage: contentful entry list [options]',
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
    const query: Record<string, any> = {}
    if (argv.contentType) query.content_type = argv.contentType
    if (argv.limit) query.limit = argv.limit
    if (argv.skip) query.skip = argv.skip

    return client.entry.getMany({query})
  },
  tableFormat: (data) => ({
    head: ['ID', 'Content Type', 'Status', 'Updated At'],
    rows: data.items.map((entry: any) => [
      entry.sys.id,
      entry.sys.contentType?.sys?.id || '-',
      getEntryStatus(entry),
      entry.sys.updatedAt || '-'
    ])
  }),
  quietExtractor: (data) => data.items.map((e: any) => e.sys.id)
})

function getEntryStatus(entry: any): string {
  if (entry.sys.archivedVersion) return 'archived'
  if (entry.sys.publishedVersion) {
    if (entry.sys.version > entry.sys.publishedVersion + 1) return 'changed'
    return 'published'
  }
  return 'draft'
}

export {command, desc, builder, handler}

import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'get <id>',
  desc: 'Get a single entry',
  feature: 'entry-get',
  usage: 'Usage: contentful entry get <id> [options]',
  handler: async (environment, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    return environment.getEntry(id)
  },
  tableFormat: (entry) => ({
    rows: [
      ['ID', entry.sys.id],
      ['Content Type', entry.sys.contentType?.sys?.id || '-'],
      ['Version', String(entry.sys.version)],
      ['Status', getEntryStatus(entry)],
      ['Updated At', entry.sys.updatedAt || '-']
    ]
  }),
  quietExtractor: (entry) => [entry.sys.id]
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

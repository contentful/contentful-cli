import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'archive <id>',
  desc: 'Archive an entry',
  feature: 'entry-archive',
  usage: 'Usage: contentful entry archive <id> [options]',
  supportsDryRun: true,
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    return client.entry.archive({entryId: id})
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await client.entry.get({entryId: id})
    return {
      dryRun: true,
      action: 'archive',
      id: entry.sys.id,
      version: entry.sys.version,
      currentlyArchived: !!entry.sys.archivedVersion
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys?.id || data.id || '-'],
      ['Version', String(data.sys?.version || data.version || '-')],
      ['Action', data.dryRun ? 'Would archive' : 'Archived']
    ]
  }),
  quietExtractor: (data) => [data.sys?.id || data.id || '']
})

export {command, desc, builder, handler}

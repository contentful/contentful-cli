import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'unarchive <id>',
  desc: 'Unarchive an entry',
  feature: 'entry-unarchive',
  usage: 'Usage: contentful entry unarchive <id> [options]',
  supportsDryRun: true,
  handler: async (environment, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await environment.getEntry(id)
    return entry.unarchive()
  },
  dryRunHandler: async (environment, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await environment.getEntry(id)
    return {
      dryRun: true,
      action: 'unarchive',
      id: entry.sys.id,
      version: entry.sys.version,
      currentlyArchived: !!entry.sys.archivedVersion
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys?.id || data.id || '-'],
      ['Version', String(data.sys?.version || data.version || '-')],
      ['Action', data.dryRun ? 'Would unarchive' : 'Unarchived']
    ]
  }),
  quietExtractor: (data) => [data.sys?.id || data.id || '']
})

export {command, desc, builder, handler}

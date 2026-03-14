import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'publish <id>',
  desc: 'Publish an entry',
  feature: 'entry-publish',
  usage: 'Usage: contentful entry publish <id> [options]',
  supportsDryRun: true,
  handler: async (environment, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await environment.getEntry(id)
    return entry.publish()
  },
  dryRunHandler: async (environment, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await environment.getEntry(id)
    return {
      dryRun: true,
      action: 'publish',
      id: entry.sys.id,
      version: entry.sys.version,
      currentlyPublished: !!entry.sys.publishedVersion
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys?.id || data.id || '-'],
      ['Version', String(data.sys?.version || data.version || '-')],
      ['Action', data.dryRun ? 'Would publish' : 'Published']
    ]
  }),
  quietExtractor: (data) => [data.sys?.id || data.id || '']
})

export {command, desc, builder, handler}

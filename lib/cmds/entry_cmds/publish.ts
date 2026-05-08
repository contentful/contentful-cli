import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'publish <id>',
  desc: 'Publish an entry',
  feature: 'entry-publish',
  usage: 'Usage: contentful entry publish <id> [options]',
  examples: [
    ['contentful entry publish 5KsDBWseXY6QegucYAoacS', 'Publish an entry'],
    ['contentful entry publish 5KsDBWseXY6QegucYAoacS --json', 'Publish and output the updated entry as JSON']
  ],
  supportsDryRun: true,
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await client.entry.get({entryId: id})
    return client.entry.publish({entryId: id}, entry)
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await client.entry.get({entryId: id})
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

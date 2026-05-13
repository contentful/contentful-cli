import { createCommand } from '../../utils/command-factory'
import { validateId } from '../../utils/validators'

const { command, desc, builder, handler } = createCommand({
  command: 'unpublish <id>',
  desc: 'Unpublish an entry',
  feature: 'entry-unpublish',
  usage: 'Usage: contentful entry unpublish <id> [options]',
  supportsDryRun: true,
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await client.entry.get({ entryId: id })
    return client.entry.unpublish({ entryId: id })
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await client.entry.get({ entryId: id })
    return {
      dryRun: true,
      action: 'unpublish',
      id: entry.sys.id,
      version: entry.sys.version,
      currentlyPublished: !!entry.sys.publishedVersion
    }
  },
  tableFormat: data => ({
    rows: [
      ['ID', data.sys?.id || data.id || '-'],
      ['Version', String(data.sys?.version || data.version || '-')],
      ['Action', data.dryRun ? 'Would unpublish' : 'Unpublished']
    ]
  }),
  quietExtractor: data => [data.sys?.id || data.id || '']
})

export { command, desc, builder, handler }

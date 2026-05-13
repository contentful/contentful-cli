import { createCommand } from '../../utils/command-factory'
import { validateId } from '../../utils/validators'

const { command, desc, builder, handler } = createCommand({
  command: 'delete <id>',
  desc: 'Delete an entry',
  feature: 'entry-delete',
  usage: 'Usage: contentful entry delete <id> [options]',
  examples: [
    [
      'contentful entry delete 5KsDBWseXY6QegucYAoacS',
      'Delete (prompts for confirmation)'
    ],
    [
      'contentful entry delete 5KsDBWseXY6QegucYAoacS --yes',
      'Delete without confirmation prompt'
    ]
  ],
  needsConfirmation: true,
  confirmationMessage:
    'Are you sure you want to delete this entry? This cannot be undone.',
  supportsDryRun: true,
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await client.entry.get({ entryId: id })

    if (entry.sys.publishedVersion) {
      throw new Error(
        `Entry ${id} is currently published. Unpublish it before deleting.`
      )
    }

    await client.entry.delete({ entryId: id })
    return { deleted: true, id: entry.sys.id }
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await client.entry.get({ entryId: id })
    return {
      dryRun: true,
      action: 'delete',
      id: entry.sys.id,
      contentType: entry.sys.contentType?.sys?.id,
      version: entry.sys.version,
      published: !!entry.sys.publishedVersion
    }
  },
  tableFormat: data => ({
    rows: [
      ['Action', data.dryRun ? 'Would delete' : 'Deleted'],
      ['ID', data.id || '-']
    ]
  }),
  quietExtractor: data => [data.id || '']
})

export { command, desc, builder, handler }

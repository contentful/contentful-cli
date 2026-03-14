import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'delete <id>',
  desc: 'Delete an entry',
  feature: 'entry-delete',
  usage: 'Usage: contentful entry delete <id> [options]',
  needsConfirmation: true,
  confirmationMessage: 'Are you sure you want to delete this entry? This cannot be undone.',
  supportsDryRun: true,
  handler: async (environment, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await environment.getEntry(id)

    if (entry.sys.publishedVersion) {
      throw new Error(
        `Entry ${id} is currently published. Unpublish it before deleting.`
      )
    }

    await entry.delete()
    return {deleted: true, id: entry.sys.id}
  },
  dryRunHandler: async (environment, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const entry = await environment.getEntry(id)
    return {
      dryRun: true,
      action: 'delete',
      id: entry.sys.id,
      contentType: entry.sys.contentType?.sys?.id,
      version: entry.sys.version,
      published: !!entry.sys.publishedVersion
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['Action', data.dryRun ? 'Would delete' : 'Deleted'],
      ['ID', data.id || '-']
    ]
  }),
  quietExtractor: (data) => [data.id || '']
})

export {command, desc, builder, handler}

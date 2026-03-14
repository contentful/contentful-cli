import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'delete <id>',
  desc: 'Delete an asset',
  feature: 'asset-delete',
  usage: 'Usage: contentful asset delete <id> [options]',
  needsConfirmation: true,
  confirmationMessage: 'Are you sure you want to delete this asset? This action cannot be undone.',
  supportsDryRun: true,
  handler: async (environment, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    const asset = await environment.getAsset(id)
    await asset.delete()
    return {sys: asset.sys}
  },
  dryRunHandler: async (environment, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    return environment.getAsset(id)
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys.id],
      ['Status', 'deleted']
    ]
  }),
  quietExtractor: (data) => [data.sys.id]
})

export {command, desc, builder, handler}

import {createCommand} from '../../utils/command-factory'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'delete <id>',
  desc: 'Delete an asset',
  feature: 'asset-delete',
  usage: 'Usage: contentful asset delete <id> [options]',
  examples: [
    ['contentful asset delete 3wtvPBbBjiMKqKGFI0MeCu', 'Delete (prompts for confirmation)'],
    ['contentful asset delete 3wtvPBbBjiMKqKGFI0MeCu --yes', 'Delete without confirmation']
  ],
  needsConfirmation: true,
  confirmationMessage: 'Are you sure you want to delete this asset? This action cannot be undone.',
  supportsDryRun: true,
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    const asset = await client.asset.get({assetId: id})
    await client.asset.delete({assetId: id})
    return {sys: asset.sys}
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    return client.asset.get({assetId: id})
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

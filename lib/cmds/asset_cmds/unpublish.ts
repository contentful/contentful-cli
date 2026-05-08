import {createCommand} from '../../utils/command-factory'
import {firstLocaleValue} from '../../utils/output'
import {validateId} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'unpublish <id>',
  desc: 'Unpublish an asset',
  feature: 'asset-unpublish',
  usage: 'Usage: contentful asset unpublish <id> [options]',
  supportsDryRun: true,
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    const asset = await client.asset.get({assetId: id})
    return client.asset.unpublish({assetId: id})
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    return client.asset.get({assetId: id})
  },
  tableFormat: (asset) => ({
    rows: [
      ['ID', asset.sys.id],
      ['Title', firstLocaleValue(asset.fields?.title) || '-'],
      ['Version', String(asset.sys.version)]
    ]
  }),
  quietExtractor: (asset) => [asset.sys.id]
})

export {command, desc, builder, handler}

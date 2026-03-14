import {createCommand} from '../../utils/command-factory'
import {firstLocaleValue} from '../../utils/output'
import {validateId} from '../../utils/validators'

function getAssetStatus(asset: any): string {
  if (asset.sys.archivedVersion) return 'archived'
  if (asset.sys.publishedVersion) {
    if (asset.sys.version > asset.sys.publishedVersion + 1) return 'changed'
    return 'published'
  }
  return 'draft'
}

const {command, desc, builder, handler} = createCommand({
  command: 'get <id>',
  desc: 'Get a single asset',
  feature: 'asset-get',
  usage: 'Usage: contentful asset get <id> [options]',
  handler: async (environment, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    return environment.getAsset(id)
  },
  tableFormat: (asset) => ({
    rows: [
      ['ID', asset.sys.id],
      ['Title', firstLocaleValue(asset.fields?.title) || '-'],
      ['File Name', firstLocaleValue(asset.fields?.file)?.fileName || '-'],
      ['URL', firstLocaleValue(asset.fields?.file)?.url || '-'],
      ['Content Type', firstLocaleValue(asset.fields?.file)?.contentType || '-'],
      ['Version', String(asset.sys.version)],
      ['Status', getAssetStatus(asset)],
      ['Updated At', asset.sys.updatedAt || '-']
    ]
  }),
  quietExtractor: (asset) => [asset.sys.id]
})

export {command, desc, builder, handler}

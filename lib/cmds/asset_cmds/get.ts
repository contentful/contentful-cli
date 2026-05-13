import { createCommand } from '../../utils/command-factory'
import { firstLocaleValue } from '../../utils/output'
import { validateId } from '../../utils/validators'
import type { AssetFileField, AssetLike } from '../../utils/contentful-types'

function getAssetStatus(asset: AssetLike): string {
  if (asset.sys.archivedVersion) return 'archived'
  if (asset.sys.publishedVersion) {
    if (asset.sys.version > asset.sys.publishedVersion + 1) return 'changed'
    return 'published'
  }
  return 'draft'
}

const { command, desc, builder, handler } = createCommand({
  command: 'get <id>',
  desc: 'Get a single asset',
  feature: 'asset-get',
  usage: 'Usage: contentful asset get <id> [options]',
  examples: [
    [
      'contentful asset get 3wtvPBbBjiMKqKGFI0MeCu',
      'Get asset details as a table'
    ],
    [
      'contentful asset get 3wtvPBbBjiMKqKGFI0MeCu --json',
      'Get full asset JSON (includes file URL, metadata)'
    ]
  ],
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    return client.asset.get({ assetId: id })
  },
  tableFormat: asset => ({
    rows: [
      ['ID', asset.sys.id],
      ['Title', firstLocaleValue(asset.fields?.title) || '-'],
      [
        'File Name',
        firstLocaleValue<AssetFileField>(asset.fields?.file)?.fileName || '-'
      ],
      ['URL', firstLocaleValue<AssetFileField>(asset.fields?.file)?.url || '-'],
      [
        'Content Type',
        firstLocaleValue<AssetFileField>(asset.fields?.file)?.contentType || '-'
      ],
      ['Version', String(asset.sys.version)],
      ['Status', getAssetStatus(asset)],
      ['Updated At', asset.sys.updatedAt || '-']
    ]
  }),
  quietExtractor: asset => [asset.sys.id]
})

export { command, desc, builder, handler }

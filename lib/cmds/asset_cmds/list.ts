import {createCommand} from '../../utils/command-factory'
import {firstLocaleValue} from '../../utils/output'

function getAssetStatus(asset: any): string {
  if (asset.sys.archivedVersion) return 'archived'
  if (asset.sys.publishedVersion) {
    if (asset.sys.version > asset.sys.publishedVersion + 1) return 'changed'
    return 'published'
  }
  return 'draft'
}

const {command, desc, builder, handler} = createCommand({
  command: 'list',
  desc: 'List assets',
  feature: 'asset-list',
  usage: 'Usage: contentful asset list [options]',
  examples: [
    ['contentful asset list', 'List all assets as a table'],
    ['contentful asset list --json --limit 5', 'Get first 5 assets as JSON'],
    ['contentful asset list --quiet', 'Output only asset IDs (one per line)']
  ],
  options: {
    query: {
      type: 'string',
      describe: 'Additional CMA query params'
    },
    limit: {
      alias: 'l',
      type: 'number',
      describe: 'Results per page (default: 100, max: 1000)'
    },
    skip: {
      type: 'number',
      describe: 'Offset for pagination'
    }
  },
  handler: async (client, argv) => {
    const query: Record<string, any> = {}
    if (argv.limit) query.limit = argv.limit
    if (argv.skip) query.skip = argv.skip

    return client.asset.getMany({query})
  },
  tableFormat: (data) => ({
    head: ['ID', 'Title', 'File Name', 'Status', 'Updated At'],
    rows: data.items.map((asset: any) => {
      const title = firstLocaleValue(asset.fields?.title) || '-'
      const file = firstLocaleValue(asset.fields?.file)
      const fileName = file?.fileName || '-'
      return [
        asset.sys.id,
        title,
        fileName,
        getAssetStatus(asset),
        asset.sys.updatedAt || '-'
      ]
    })
  }),
  quietExtractor: (data) => data.items.map((a: any) => a.sys.id)
})

export {command, desc, builder, handler}

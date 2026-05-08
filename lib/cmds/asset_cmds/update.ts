import {createCommand} from '../../utils/command-factory'
import {firstLocaleValue} from '../../utils/output'
import {validateId, validateJsonFields, validatePositiveInt} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'update <id>',
  desc: 'Update an asset',
  feature: 'asset-update',
  usage: 'Usage: contentful asset update <id> --fields <json> --version <n> [options]',
  examples: [
    ['contentful asset update 3wtvPBbBjiMKqKGFI0MeCu --version 2 --fields \'{"title": {"en-US": "New Title"}}\'', 'Update asset title'],
    ['contentful asset update 3wtvPBbBjiMKqKGFI0MeCu --version 2 --fields \'{"description": {"en-US": "A photo"}}\' --dry-run', 'Preview update']
  ],
  supportsDryRun: true,
  options: {
    fields: {
      type: 'string',
      describe: 'JSON object of fields to merge into the asset',
      demandOption: true
    },
    version: {
      type: 'number',
      describe: 'Current version of the asset (required for optimistic locking)',
      demandOption: true
    }
  },
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    const fields = validateJsonFields(argv.fields)
    const version = validatePositiveInt(argv.version, '--version')

    const asset = await client.asset.get({assetId: id})

    if (asset.sys.version !== version) {
      throw new Error(
        `Version conflict: provided version ${version} does not match current version ${asset.sys.version}`
      )
    }

    asset.fields = {...asset.fields, ...fields}
    return client.asset.update({assetId: id}, asset)
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Asset ID')
    const fields = validateJsonFields(argv.fields)
    const version = validatePositiveInt(argv.version, '--version')

    const asset = await client.asset.get({assetId: id})

    if (asset.sys.version !== version) {
      throw new Error(
        `Version conflict: provided version ${version} does not match current version ${asset.sys.version}`
      )
    }

    return {...asset, fields: {...asset.fields, ...fields}}
  },
  tableFormat: (asset) => ({
    rows: [
      ['ID', asset.sys.id],
      ['Title', firstLocaleValue(asset.fields?.title) || '-'],
      ['File Name', firstLocaleValue(asset.fields?.file)?.fileName || '-'],
      ['Version', String(asset.sys.version)],
      ['Updated At', asset.sys.updatedAt || '-']
    ]
  }),
  quietExtractor: (asset) => [asset.sys.id]
})

export {command, desc, builder, handler}

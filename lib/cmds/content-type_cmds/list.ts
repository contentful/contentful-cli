import { createCommand } from '../../utils/command-factory'

const { command, desc, builder, handler } = createCommand({
  command: 'list',
  desc: 'List your content types',
  feature: 'content_type-list',
  usage: 'Usage: contentful content-type list [options]',
  examples: [
    ['contentful content-type list', 'List all content types as a table'],
    [
      'contentful content-type list --json',
      'Get all content types as JSON (includes field definitions)'
    ],
    ['contentful content-type list --quiet', 'Output only content type IDs']
  ],
  options: {
    order: {
      type: 'string',
      describe: 'Order results (e.g. "name,sys.id")',
      default: 'name,sys.id'
    }
  },
  handler: async (client, argv) => {
    const query: Record<string, any> = { order: argv.order }
    return client.contentType.getMany({ query })
  },
  tableFormat: data => ({
    head: ['Content Type Name', 'Content Type ID'],
    rows: data.items.map((ct: any) => [ct.name, ct.sys.id])
  }),
  quietExtractor: data => data.items.map((ct: any) => ct.sys.id)
})

export { command, desc, builder, handler }

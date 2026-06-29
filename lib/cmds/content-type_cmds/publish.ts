import { createCommand } from '../../utils/command-factory'

/**
 * Publish (activate) a content type.
 * In Contentful CMA terminology this is "activation", but we expose it as
 * "publish" for consistency with the entry/asset command surface.
 */
const { command, desc, builder, handler } = createCommand({
  command: 'publish',
  desc: 'Publish a content type',
  feature: 'content_type-publish',
  usage: 'Usage: contentful content-type publish --id <id> [options]',
  options: {
    id: {
      type: 'string',
      describe: 'Content type ID',
      demandOption: true
    }
  },
  handler: async (client, argv) => {
    const contentType = await client.contentType.get({ contentTypeId: argv.id })
    return client.contentType.publish({ contentTypeId: argv.id }, contentType)
  },
  tableFormat: ct => ({
    rows: [
      ['ID', ct.sys.id],
      ['Name', ct.name],
      ['Version', String(ct.sys.version)],
      ['Published', ct.sys.publishedVersion ? 'Yes' : 'No']
    ]
  }),
  quietExtractor: ct => [ct.sys.id]
})

export { command, desc, builder, handler }

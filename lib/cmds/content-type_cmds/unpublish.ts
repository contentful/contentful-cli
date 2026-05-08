import {createCommand} from '../../utils/command-factory'

const {command, desc, builder, handler} = createCommand({
  command: 'unpublish',
  desc: 'Unpublish a content type',
  feature: 'content_type-unpublish',
  usage: 'Usage: contentful content-type unpublish --id <id> [options]',
  options: {
    id: {
      type: 'string',
      describe: 'Content type ID',
      demandOption: true
    }
  },
  handler: async (client, argv) => {
    return client.contentType.unpublish({contentTypeId: argv.id})
  },
  tableFormat: (ct) => ({
    rows: [
      ['ID', ct.sys.id],
      ['Name', ct.name],
      ['Version', String(ct.sys.version)],
      ['Published', ct.sys.publishedVersion ? 'Yes' : 'No']
    ]
  }),
  quietExtractor: (ct) => [ct.sys.id]
})

export {command, desc, builder, handler}

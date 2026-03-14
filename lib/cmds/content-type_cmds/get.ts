import {createCommand} from '../../utils/command-factory'

const {command, desc, builder, handler} = createCommand({
  command: 'get',
  desc: 'Show a content type',
  feature: 'content_type-get',
  usage: 'Usage: contentful content-type get --id <id> [options]',
  options: {
    id: {
      type: 'string',
      describe: 'Content Type id',
      demandOption: true
    }
  },
  handler: async (environment, argv) => {
    return environment.getContentType(argv.id)
  },
  tableFormat: (ct) => ({
    rows: [
      ['ID', ct.sys.id],
      ['Name', ct.name],
      ['Description', ct.description || '-'],
      ['Display Field', ct.displayField || '-'],
      ['Fields', String(ct.fields?.length || 0)],
      ['Version', String(ct.sys.version)],
      ['Published', ct.sys.publishedVersion ? 'Yes' : 'No']
    ]
  }),
  quietExtractor: (ct) => [ct.sys.id]
})

export {command, desc, builder, handler}

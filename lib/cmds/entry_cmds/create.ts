import {createCommand} from '../../utils/command-factory'
import {validateId, validateJsonFields} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'create',
  desc: 'Create an entry',
  feature: 'entry-create',
  usage: 'Usage: contentful entry create [options]',
  examples: [
    ['contentful entry create --content-type blogPost --fields \'{"title": {"en-US": "Hello World"}, "body": {"en-US": "Content here"}}\'', 'Create a blog post entry'],
    ['contentful entry create --ct page --fields \'{"title": {"en-US": "About"}}\' --id my-about-page', 'Create with a custom ID'],
    ['contentful entry create --ct blogPost --fields \'{"title": {"en-US": "Draft"}}\' --dry-run', 'Preview without creating']
  ],
  supportsDryRun: true,
  options: {
    'content-type': {
      alias: 'ct',
      type: 'string',
      describe: 'Content type ID',
      demandOption: true
    },
    fields: {
      alias: 'f',
      type: 'string',
      describe:
        'Fields as JSON (locale-wrapped format, e.g. {"title": {"en-US": "Hello"}})',
      demandOption: true
    },
    id: {
      type: 'string',
      describe: 'Custom entry ID (auto-generated if omitted)'
    }
  },
  handler: async (client, argv) => {
    const contentTypeId = validateId(argv.contentType, 'Content type ID')
    const fields = validateJsonFields(argv.fields)

    if (argv.id) {
      validateId(argv.id, 'Entry ID')
      return client.entry.createWithId({contentTypeId, entryId: argv.id}, {fields})
    }
    return client.entry.create({contentTypeId}, {fields})
  },
  dryRunHandler: async (client, argv) => {
    const contentTypeId = validateId(argv.contentType, 'Content type ID')
    const fields = validateJsonFields(argv.fields)
    await client.contentType.get({contentTypeId})
    return {
      dryRun: true,
      action: 'create',
      contentType: contentTypeId,
      entryId: argv.id || '(auto-generated)',
      fields
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys?.id || data.entryId || '-'],
      ['Content Type', data.sys?.contentType?.sys?.id || data.contentType || '-'],
      ['Version', String(data.sys?.version || '-')]
    ]
  }),
  quietExtractor: (data) => [data.sys?.id || data.entryId || '']
})

export {command, desc, builder, handler}

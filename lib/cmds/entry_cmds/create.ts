import {createCommand} from '../../utils/command-factory'
import {validateId, validateJsonFields} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'create',
  desc: 'Create an entry',
  feature: 'entry-create',
  usage: 'Usage: contentful entry create [options]',
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
  handler: async (environment, argv) => {
    const contentTypeId = validateId(argv.contentType, 'Content type ID')
    const fields = validateJsonFields(argv.fields)

    if (argv.id) {
      validateId(argv.id, 'Entry ID')
      return environment.createEntryWithId(contentTypeId, argv.id, {fields})
    }
    return environment.createEntry(contentTypeId, {fields})
  },
  dryRunHandler: async (environment, argv) => {
    const contentTypeId = validateId(argv.contentType, 'Content type ID')
    const fields = validateJsonFields(argv.fields)
    await environment.getContentType(contentTypeId) // validate CT exists
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

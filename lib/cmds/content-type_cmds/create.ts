import {createCommand} from '../../utils/command-factory'

/**
 * Parse and validate the --fields option as a JSON array of field definitions.
 * Content type fields must be an array of objects, not a plain object.
 */
function parseFieldsArray(value: string): any[] {
  let parsed: any
  try {
    parsed = JSON.parse(value)
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in --fields: ${err.message}`)
    }
    throw err
  }
  if (!Array.isArray(parsed)) {
    throw new Error('--fields must be a JSON array of field definitions')
  }
  return parsed
}

const {command, desc, builder, handler} = createCommand({
  command: 'create',
  desc: 'Create a content type',
  feature: 'content_type-create',
  usage: 'Usage: contentful content-type create [options]',
  supportsDryRun: true,
  options: {
    name: {
      alias: 'n',
      type: 'string',
      describe: 'Content type name',
      demandOption: true
    },
    fields: {
      alias: 'f',
      type: 'string',
      describe: 'Field definitions as JSON array',
      demandOption: true
    },
    id: {
      type: 'string',
      describe: 'Custom content type ID'
    },
    description: {
      alias: 'd',
      type: 'string',
      describe: 'Content type description'
    },
    'display-field': {
      type: 'string',
      describe: 'ID of the field used as display field'
    }
  },
  handler: async (environment, argv) => {
    const fields = parseFieldsArray(argv.fields)
    const data: any = {name: argv.name, fields}
    if (argv.description) data.description = argv.description
    if (argv.displayField) data.displayField = argv.displayField

    if (argv.id) {
      return environment.createContentTypeWithId(argv.id, data)
    }
    return environment.createContentType(data)
  },
  dryRunHandler: async (_environment, argv) => {
    const fields = parseFieldsArray(argv.fields)
    return {
      dryRun: true,
      action: 'create',
      name: argv.name,
      id: argv.id || '(auto-generated)',
      fields,
      description: argv.description,
      displayField: argv.displayField
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys?.id || data.id || '-'],
      ['Name', data.name || '-'],
      ['Fields', String(data.fields?.length || '-')]
    ]
  }),
  quietExtractor: (data) => [data.sys?.id || data.id || '']
})

export {command, desc, builder, handler}

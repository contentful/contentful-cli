import { createCommand } from '../../utils/command-factory'
import type { CreateContentTypeProps } from 'contentful-management'

/**
 * Parse and validate the --fields option as a JSON array of field definitions.
 * Content type fields must be an array of objects, not a plain object.
 */
function parseFieldsArray(value: string): CreateContentTypeProps['fields'] {
  let parsed: unknown
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
  return parsed as CreateContentTypeProps['fields']
}

const { command, desc, builder, handler } = createCommand({
  command: 'create',
  desc: 'Create a content type',
  feature: 'content_type-create',
  usage: 'Usage: contentful content-type create [options]',
  examples: [
    [
      'contentful content-type create --name "Blog Post" --fields \'[{"id":"title","name":"Title","type":"Symbol","required":true},{"id":"body","name":"Body","type":"Text"}]\'',
      'Create with two fields'
    ],
    [
      'contentful content-type create --name "Page" --fields \'[{"id":"title","name":"Title","type":"Symbol"}]\' --id page --display-field title',
      'Create with custom ID and display field'
    ]
  ],
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
  handler: async (client, argv) => {
    const fields = parseFieldsArray(argv.fields)
    const data: CreateContentTypeProps = { name: argv.name, fields }
    if (argv.description) data.description = argv.description
    if (argv.displayField) data.displayField = argv.displayField

    if (argv.id) {
      return client.contentType.createWithId({ contentTypeId: argv.id }, data)
    }
    return client.contentType.create({}, data)
  },
  dryRunHandler: async (_client, argv) => {
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
  tableFormat: data => ({
    rows: [
      ['ID', data.sys?.id || data.id || '-'],
      ['Name', data.name || '-'],
      ['Fields', String(data.fields?.length || '-')]
    ]
  }),
  quietExtractor: data => [data.sys?.id || data.id || '']
})

export { command, desc, builder, handler }

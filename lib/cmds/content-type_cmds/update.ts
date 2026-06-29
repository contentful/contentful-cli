import { createCommand } from '../../utils/command-factory'
import type { CreateContentTypeProps } from 'contentful-management'

/**
 * Parse and validate the --fields option as a JSON array of field definitions.
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
  command: 'update',
  desc: 'Update a content type',
  feature: 'content_type-update',
  usage:
    'Usage: contentful content-type update --id <id> --version <version> [options]',
  examples: [
    [
      'contentful content-type update --id blogPost --version 3 --name "Article"',
      'Rename a content type'
    ],
    [
      'contentful content-type update --id blogPost --version 3 --fields \'[{"id":"title","name":"Title","type":"Symbol","required":true}]\'',
      'Replace field definitions'
    ]
  ],
  options: {
    id: {
      type: 'string',
      describe: 'Content type ID',
      demandOption: true
    },
    version: {
      type: 'number',
      describe: 'Current version of the content type (for optimistic locking)',
      demandOption: true
    },
    name: {
      alias: 'n',
      type: 'string',
      describe: 'New content type name'
    },
    fields: {
      alias: 'f',
      type: 'string',
      describe: 'Updated field definitions as JSON array'
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
    const contentType = await client.contentType.get({ contentTypeId: argv.id })

    // Verify version for optimistic locking
    if (contentType.sys.version !== argv.version) {
      throw new Error(
        `Version conflict: content type is at version ${contentType.sys.version}, ` +
          `but --version ${argv.version} was provided`
      )
    }

    if (argv.name !== undefined) contentType.name = argv.name
    if (argv.description !== undefined)
      contentType.description = argv.description
    if (argv.displayField !== undefined)
      contentType.displayField = argv.displayField
    if (argv.fields !== undefined) {
      contentType.fields = parseFieldsArray(argv.fields)
    }

    return client.contentType.update({ contentTypeId: argv.id }, contentType)
  },
  tableFormat: ct => ({
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
  quietExtractor: ct => [ct.sys.id]
})

export { command, desc, builder, handler }

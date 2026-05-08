import {createCommand} from '../../utils/command-factory'
import {validateId, validateJsonFields, validatePositiveInt} from '../../utils/validators'

const {command, desc, builder, handler} = createCommand({
  command: 'update <id>',
  desc: 'Update an entry',
  feature: 'entry-update',
  usage: 'Usage: contentful entry update <id> [options]',
  supportsDryRun: true,
  options: {
    fields: {
      alias: 'f',
      type: 'string',
      describe: 'Fields to update as JSON (locale-wrapped format)',
      demandOption: true
    },
    version: {
      alias: 'v',
      type: 'number',
      describe: 'Current entry version (required for optimistic locking)',
      demandOption: true
    }
  },
  handler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const fields = validateJsonFields(argv.fields)
    const version = validatePositiveInt(argv.version, '--version')

    const entry = await client.entry.get({entryId: id})

    if (entry.sys.version !== version) {
      throw new Error(
        `Version conflict: entry is at version ${entry.sys.version}, ` +
          `but --version ${version} was provided`
      )
    }

    Object.assign(entry.fields, fields)
    return client.entry.update({entryId: id}, entry)
  },
  dryRunHandler: async (client, argv) => {
    const id = validateId(argv.id, 'Entry ID')
    const fields = validateJsonFields(argv.fields)
    const version = validatePositiveInt(argv.version, '--version')

    const entry = await client.entry.get({entryId: id})

    if (entry.sys.version !== version) {
      throw new Error(
        `Version conflict: entry is at version ${entry.sys.version}, ` +
          `but --version ${version} was provided`
      )
    }

    return {
      dryRun: true,
      action: 'update',
      id: entry.sys.id,
      currentVersion: entry.sys.version,
      fieldsToUpdate: fields
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys?.id || data.id || '-'],
      ['Version', String(data.sys?.version || data.currentVersion || '-')],
      ['Action', data.dryRun ? 'Would update' : 'Updated']
    ]
  }),
  quietExtractor: (data) => [data.sys?.id || data.id || '']
})

export {command, desc, builder, handler}

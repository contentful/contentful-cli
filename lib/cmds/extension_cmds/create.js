import Table from 'cli-table2'

import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { getId } from '../../utils/helpers'
import { log } from '../../utils/log'

export const command = 'create'

export const desc = 'Show an extension'

export const builder = (yargs) => {
  return yargs
  .option('id', { type: 'string', describe: 'Extension id' })
  .option('name', { type: 'string', demand: true, describe: 'Extension name' })
  .option('space-id', { type: 'string', describe: 'Space id' })
  .option('field-types', { type: 'array', describe: 'Field types' })
  .option('descriptor', { type: 'string', describe: 'Path to descriptor file' })
  .option('src', { type: '', describe: 'Path to descriptor file' })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

async function extensionShow (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const contentTypeId = getId(argv)
  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)
  const result = await space.getContentType(contentTypeId)

  const { sys, name, displayField, fields } = result

  const table = new Table({
    head: ['CT Property', 'CT Value']
  })

  table.push(['ID', sys.id])
  table.push(['Name', name])
  table.push(['Display Field', displayField])

  log(table.toString())

  const fieldsTable = new Table({
    head: ['*', 'Field ID', 'Field Name', 'Field Type', 'Required']
  })

  fields.forEach(({ id, name, type, required }) => {
    const isDisplayField = id === displayField
    const displayFieldIndicator = isDisplayField ? '*' : ''
    fieldsTable.push([displayFieldIndicator, id, name, type, required])
  })

  log(fieldsTable.toString())
}

export const handler = handle(extensionShow)

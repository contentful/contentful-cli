import Table from 'cli-table3'

import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { log } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'
import { getId } from '../../utils/helpers'

export const command = 'get'

export const desc = 'Show a content type'

export const builder = (yargs) => {
  return yargs
    .option('id', { type: 'string', demand: true, describe: 'Content Type id' })
    .option('space-id', { alias: 's', type: 'string', describe: 'Space id' })
    .option('management-token', { alias: 'mt', type: 'string', describe: 'Contentful management API token' })
    .option('environment-id', { type: 'string', describe: 'Environment id', default: 'master' })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

async function ctShow (argv) {
  const { context } = argv
  await assertLoggedIn(context)
  await assertSpaceIdProvided(context)

  const contentTypeId = getId(argv)
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'content_type-get'
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)
  const result = await environment.getContentType(contentTypeId)

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

export const handler = handle(ctShow)

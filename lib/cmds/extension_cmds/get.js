import { createManagementClient } from '../../utils/contentful-clients.js'
import { handleAsyncError as handle } from '../../utils/async.js'
import { logExtension } from './utils/log-as-table.js'
import { getHeadersFromOption } from '../../utils/headers.js'

export const command = 'get'

export const desc = 'Show an extension'

export const builder = yargs => {
  return yargs
    .option('id', { type: 'string', demand: true, describe: 'Extension id' })
    .option('management-token', {
      alias: 'mt',
      type: 'string',
      describe: 'Contentful management API token'
    })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id' })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

async function getExtension({ context, id, header }) {
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'extension-get',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)
  const extension = await environment.getUiExtension(id)

  logExtension(extension, activeSpaceId, activeEnvironmentId)
}

export const handler = handle(getExtension)

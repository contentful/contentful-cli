const { createManagementClient } = require('../../utils/contentful-clients')
const { handleAsyncError: handle } = require('../../utils/async')
const { logExtension } = require('./utils/log-as-table')

module.exports.command = 'get'

module.exports.desc = 'Show an extension'

module.exports.builder = yargs => {
  return yargs
    .option('id', { type: 'string', demand: true, describe: 'Extension id' })
    .option('management-token', {
      alias: 'mt',
      type: 'string',
      describe: 'Contentful management API token'
    })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id' })
    .epilog('Copyright 2019 Contentful')
}

async function getExtension({ context, id }) {
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'extension-get'
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)
  const extension = await environment.getUiExtension(id)

  logExtension(extension, activeSpaceId, activeEnvironmentId)
}

module.exports.handler = handle(getExtension)

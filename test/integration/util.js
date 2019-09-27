const appRoot = require('app-root-path')
const Promise = require('bluebird')
const { resolve } = require('path')
const { homedir } = require('os')
const { writeFile, stat } = require('mz/fs')
const { createManagementClient } = require('../../lib/utils/contentful-clients')

module.exports.expectedDir = `${appRoot}/test/integration/expected`
module.exports.tmpDir = `${appRoot}/test/integration/expected/tmp`
const configFile = resolve(homedir(), '.contentfulrc.json')
module.exports.configFile = configFile

async function initConfig() {
  try {
    await stat(configFile)
  } catch (e) {
    return writeFile(
      configFile,
      JSON.stringify(
        { managementToken: process.env.CLI_E2E_CMA_TOKEN },
        null,
        4
      )
    )
  }

  const configParams = require(configFile)

  if (configParams.managementToken !== null) {
    return configParams
  }

  return writeFile(
    configFile,
    JSON.stringify({ managementToken: process.env.CLI_E2E_CMA_TOKEN }, null, 4)
  )
}

module.exports.initConfig = initConfig

async function deleteSpaces(spacesToDelete) {
  const client = await createManagementClient({
    accessToken: process.env.CLI_E2E_CMA_TOKEN
  })
  await Promise.map(
    spacesToDelete,
    spaceId => {
      return client.getSpace(spaceId).then(
        space => {
          // Add delay here because there is a bug that you can't delete a space
          // with environment that has a status of inprogress
          return Promise.delay(1000).then(() => space.delete())
        },
        error => {
          console.log('Can not find space to delete with id: ', spaceId, error)
        }
      )
    },
    { concurrency: 1 }
  )
}

module.exports.deleteSpaces = deleteSpaces

function extractSpaceId(text) {
  var regex = /successfully created space \w* \((.*)\)/i
  var found = text.match(regex)
  return found[1]
}

module.exports.extractSpaceId = extractSpaceId

async function createSimpleSpace(organization, spaceName) {
  const client = await createManagementClient({
    accessToken: process.env.CLI_E2E_CMA_TOKEN
  })
  return client.createSpace(
    {
      name: 'IntegrationTest_' + spaceName
    },
    organization
  )
}

module.exports.createSimpleSpace = createSimpleSpace

async function addNewCT(spaceId, name, fields) {
  const client = await createManagementClient({
    accessToken: process.env.CLI_E2E_CMA_TOKEN
  })
  var space = await client.getSpace(spaceId)
  var contentType = await space.createContentType({
    name: name,
    fields: fields
  })
  await contentType.publish()
  return contentType
}

module.exports.addNewCT = addNewCT

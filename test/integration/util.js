import appRoot from 'app-root-path'
import { resolve } from 'path'
import { homedir } from 'os'
import { writeFile, stat } from 'mz/fs'
import { createManagementClient } from '../../lib/utils/contentful-clients'
import { createTestSpace, initClient } from '@contentful/integration-test-utils'

module.exports.expectedDir = `${appRoot}/test/integration/expected`
module.exports.tmpDir = `${appRoot}/test/integration/expected/tmp`
const configFile = resolve(homedir(), '.contentfulrc.json')
const organizationId = process.env.CLI_E2E_ORG_ID
module.exports.configFile = configFile

export async function initConfig() {
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

export function extractSpaceId(text) {
  const regex = /successfully created space .*/i
  const sentenceWithSpaceId = text.match(regex)
  const found = sentenceWithSpaceId[0].match(/\((.*)\)/i)
  return found[1]
}

const client = initClient()

export async function createSimpleSpace(testSuiteName = 'CLI Test Space') {
  return createTestSpace({
    client,
    repo: 'CLI',
    organizationId,
    language: 'JS',
    testSuiteName
  })
}

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

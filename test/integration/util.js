import appRoot from 'app-root-path'
import { resolve } from 'path'
import { homedir } from 'os'
import { createManagementClient } from '../../lib/utils/contentful-clients'
import {
  createTestEnvironment,
  createTestSpace,
  initClient
} from '@contentful/integration-test-utils'

module.exports.expectedDir = `${appRoot}/test/integration/expected`
module.exports.tmpDir = `${appRoot}/test/integration/expected/tmp`
const configFile = resolve(homedir(), '.contentfulrc.json')
module.exports.configFile = configFile
const organizationId = process.env.CLI_E2E_ORG_ID

export function extractSpaceId(text) {
  const regex = /successfully created space .*/i
  const sentenceWithSpaceId = text.match(regex)
  const found = sentenceWithSpaceId[0].match(/\((.*)\)/i)
  return found[1]
}

export const client = initClient()

export async function createSimpleSpace(testSuiteName = 'CLI Test Space') {
  return createTestSpace({
    client,
    repo: 'CLI',
    organizationId,
    language: 'JS',
    testSuiteName
  })
}

export async function createSimpleEnvironment(spaceId, environmentName) {
  const space = await client.getSpace(spaceId)

  return createTestEnvironment(space, environmentName)
}

export async function deleteSpace(spaceId) {
  const space = await client.getSpace(spaceId)
  await space.delete()
}

async function addNewCT(spaceId, name, fields) {
  const client = await createManagementClient({
    accessToken: process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN
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

function replaceCopyrightYear(text) {
  return text.replace(/(?<=Copyright\s).[0-9]+/g, '2013')
}

module.exports.replaceCopyrightYear = replaceCopyrightYear

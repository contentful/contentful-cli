import appRoot from 'app-root-path'
import Promise from 'bluebird'
import { resolve } from 'path'
import { homedir } from 'os'
import { writeFile, stat } from 'mz/fs'
import { createManagementClient } from '../../lib/utils/contentful-clients'

export const expectedDir = `${appRoot}/test/integration/expected`
export const tmpDir = `${appRoot}/test/integration/expected/tmp`
export const configFile = resolve(homedir(), '.contentfulrc.json')

export async function initConfig () {
  try {
    await stat(configFile)
  } catch (e) {
    return writeFile(configFile, JSON.stringify({ cmaToken: process.env.CLI_E2E_CMA_TOKEN }, null, 4))
  }

  const configParams = require(configFile)

  if (configParams.cmaToken !== null) {
    return configParams
  }

  return writeFile(configFile, JSON.stringify({ cmaToken: process.env.CLI_E2E_CMA_TOKEN }, null, 4))
}

export async function deleteSpaces (spacesToDelete) {
  const client = await createManagementClient({accessToken: process.env.CLI_E2E_CMA_TOKEN})
  await Promise.map(spacesToDelete, (spaceId) => {
    return client.getSpace(spaceId).then((space) => {
      // Add delay here because there is a bug that you can't delete a space
      // with environment that has a status of inprogress
      return Promise.delay(1000).then(() => space.delete())
    }, (error) => {
      console.log('Can not find space to delete with id: ', spaceId, error)
    })
  }, {concurrency: 1})
}

export function extractSpaceId (text) {
  var regex = /successfully created space \w* \((.*)\)/i
  var found = text.match(regex)
  return found[1]
}

export async function createSimpleSpace (organization) {
  const client = await createManagementClient({accessToken: process.env.CLI_E2E_CMA_TOKEN})
  return client.createSpace({
    name: 'SimpleSpace_' + Date.now()
  }, organization)
}

export async function addNewCT (spaceId, name, fields) {
  const client = await createManagementClient({accessToken: process.env.CLI_E2E_CMA_TOKEN})
  var space = await client.getSpace(spaceId)
  var contentType = await space.createContentType({
    name: name,
    fields: fields
  })
  await contentType.publish()
  return contentType
}

import appRoot from 'app-root-path'
import Promise from 'bluebird'
import { resolve } from 'path'
import { homedir } from 'os'
import { createClient } from 'contentful-management'
import { readFileSync, writeFile, stat } from 'mz/fs'

export const expectedDir = `${appRoot}/test/integration/expected`
export const tmpDir = `${appRoot}/test/integration/expected/tmp`
export const configFile = resolve(homedir(), '.contentfulrc.json')

async function createManagementClient () {
  const config = require(configFile)
  return createClient({
    accessToken: config.cmaToken
  })
}

export async function initConfig () {
  try {
    await stat(configFile)
  } catch (e) {
    return writeFile(configFile, JSON.stringify({ cmaToken: process.env.CMA_TOKEN }, null, 4))
  }

  const configParams = require(configFile)

  if (configParams.cmaToken !== null) {
    return configParams
  }

  return writeFile(configFile, JSON.stringify({ cmaToken: process.env.CMA_TOKEN }, null, 4))
}

export function read (filepath) {
  return readFileSync(filepath, 'utf-8').trim()
}

export async function deleteSpaces (spacesToDelete) {
  const client = await createManagementClient()
  await Promise.map(spacesToDelete, (spaceId) => {
    return client.getSpace(spaceId).then((space) => {
      return space.delete()
    }, (error) => {
      console.log('Can not find space to delete with id: ', spaceId, error)
    })
  })
}

export function extractSpaceId (text) {
  var regex = /successfully created space \w* \((.*)\)/i
  var found = text.match(regex)
  return found[1]
}

export function extractPatchFile (text, contentType) {
  var regex = new RegExp(contentType + ' --> (.*) ')
  var found = text.match(regex)
  return found[1]
}

export async function createSimpleSpace (organization) {
  const client = await createManagementClient()
  return client.createSpace({
    name: 'SimpleSpace_' + Date.now()
  }, organization)
}

export async function addNewCT (spaceId, name, fields) {
  const client = await createManagementClient()
  var space = await client.getSpace(spaceId)
  var contentType = await space.createContentType({
    name: name,
    fields: fields
  })
  await contentType.publish()
  return contentType
}

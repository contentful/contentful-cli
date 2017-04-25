import { readFile, stat, writeFile } from 'mz/fs'
import { resolve } from 'path'
import { homedir } from 'os'

let context

export function getConfigPath () {
  return resolve(homedir(), '.contentfulrc.json')
}

export async function getContext () {
  if (!context) {
    context = await loadRuntimeConfig()
  }

  return context
}

export function setContext (newContext) {
  context = {
    ...context,
    ...newContext
  }
}

export function emptyContext (newContext) {
  context = null
}

function loadRuntimeConfig () {
  const configPath = getConfigPath()

  return stat(configPath)
  .then(() => {
    return readFile(configPath)
    .then((content) => content.toString())
    .then(JSON.parse)
  })
  .catch(() => ({}))
  .then((configFileContent) => {
    context = {
      ...context,
      ...configFileContent
    }
    return context
  })
}

export function storeRuntimeConfig () {
  const contextToStore = {
    cmaToken: context.cmaToken,
    activeSpaceId: context.activeSpaceId
  }
  return writeFile(getConfigPath(), JSON.stringify(contextToStore, null, 2) + '\n')
}

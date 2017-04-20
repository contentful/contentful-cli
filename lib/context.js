import { readFile, stat, writeFile } from 'mz/fs'
import { resolve } from 'path'
import { homedir } from 'os'

let context = {}

export function getConfigPath () {
  return resolve(homedir(), '.contentfulrc.json')
}

export function getContext () {
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

export function setContext (newContext) {
  context = {
    ...context,
    ...newContext
  }
  return context
}

export function storeContext () {
  const contextToStore = {
    cmaToken: context.cmaToken,
    activeSpaceId: context.activeSpaceId
  }
  return writeFile(getConfigPath(), JSON.stringify(contextToStore, null, 2) + '\n')
}

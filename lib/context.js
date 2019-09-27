const { readFile, writeFile } = require('mz/fs');
const { resolve } = require('path');
const { homedir } = require('os');
const findUp = require('find-up');

const { proxyStringToObject } = require('./utils/proxy');

let context
let configPath

export async function getConfigPath () {
  const contentfulrc = '.contentfulrc.json'
  const defaultPath = resolve(homedir(), contentfulrc)
  const nestedConfigPath = await findUp(contentfulrc)
  configPath = nestedConfigPath || defaultPath
  return configPath
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

function loadProxyFromEnv (env) {
  const proxyString = env['https_proxy'] || env['HTTPS_PROXY'] || env['http_proxy'] || env['HTTP_PROXY']

  // Delete all potential proxy keys `axios` might use
  delete env['http_proxy']
  delete env['HTTP_PROXY']
  delete env['https_proxy']
  delete env['HTTPS_PROXY']

  if (!proxyString) {
    return {}
  }

  const proxy = proxyStringToObject(proxyString)
  return { proxy }
}

async function loadRuntimeConfig () {
  const configPath = await getConfigPath()
  let configFileContent

  try {
    const content = await readFile(configPath)
    configFileContent = JSON.parse(content.toString())
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }

    configFileContent = {}
  }

  const environment = loadProxyFromEnv(process.env)

  context = {
    ...context,
    ...configFileContent,
    ...environment
  }

  return context
}

export async function storeRuntimeConfig () {
  const contextToStore = {
    managementToken: context.managementToken,
    activeSpaceId: context.activeSpaceId,
    activeEnvironmentId: context.activeEnvironmentId,
    host: context.host,
    proxy: context.proxy,
    rawProxy: context.rawProxy
  }
  return writeFile(await getConfigPath(), JSON.stringify(contextToStore, null, 2) + '\n')
}

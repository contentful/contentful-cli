const yargs = require('yargs')
const { getContext } = require('../context')
const config = require('../config')
const { assertLoggedIn, assertSpaceIdProvided } = require('./assertions')
const { handleAsyncError: handle } = require('./async')

module.exports.getCommand = () => {
  const { fullCommands } = yargs.getContext()
  const cmd = fullCommands.join(' ')
  return { cmd }
}

module.exports.buildContext = async argv => {
  const {
    managementToken,
    spaceId,
    activeSpaceId,
    environmentId,
    activeEnvironmentId,
    insecure,
    host,
    rawProxy,
    proxy
  } = argv

  const context = await getContext()

  if (managementToken) {
    context.managementToken = managementToken
  }

  const space = spaceId || activeSpaceId
  if (space) {
    context.activeSpaceId = space
  }

  const environment = environmentId || activeEnvironmentId
  if (environment) {
    context.activeEnvironmentId = environment
  }
  if (!context.activeEnvironmentId) {
    context.activeEnvironmentId = 'master'
  }

  // Only included if explicitly set
  if (typeof insecure !== 'undefined') {
    context.insecure = insecure.toString() === 'true'
  }

  if (host) {
    context.host = host
  }
  if (!context.host) {
    context.host = 'api.contentful.com'
  }

  if (rawProxy !== undefined) {
    context.rawProxy = rawProxy
  }
  if (proxy) {
    context.proxy = proxy
  }

  return { context }
}

module.exports.assertContext = async ({ cmd, context }) => {
  const { noAuthNeeded, noSpaceIdNeeded } = config

  if (cmd && !noAuthNeeded.includes(cmd)) {
    handle(assertLoggedIn)(context)
  }
  if (cmd && !noSpaceIdNeeded.includes(cmd)) {
    handle(assertSpaceIdProvided)(context)
  }
}

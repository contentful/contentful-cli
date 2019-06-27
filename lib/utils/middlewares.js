import yargs from 'yargs'
import {getContext} from '../context'
import config from '../config'
import {assertLoggedIn, assertSpaceIdProvided} from './assertions'
import {handleAsyncError} from './async'

export const getCommand = async () => {
  const {fullCommands} = yargs.getContext()
  const cmd = fullCommands.join(' ')
  return {cmd}
}

export const buildContext = async (argv) => {
  const {
    managementToken,
    spaceId,
    activeSpaceId,
    environmentId,
    activeEnvironmentId,
    host,
    rawProxy,
    proxy
  } = argv

  const context = await getContext()

  if (managementToken) { context.managementToken = managementToken }

  const space = spaceId || activeSpaceId
  if (space) { context.activeSpaceId = space }

  const environment = environmentId || activeEnvironmentId
  if (environment) { context.activeEnvironmentId = environment }
  if (!context.activeEnvironmentId) { context.activeEnvironmentId = 'master' }

  if (host) { context.host = host }
  if (!context.host) { context.host = 'api.contentful.com' }

  if (rawProxy !== undefined) { context.rawProxy = rawProxy }
  if (proxy) { context.proxy = proxy }

  return {context}
}

export const assertContext = async ({ cmd, context }) => {
  const {
    noAuthNeeded,
    noSpaceIdNeeded
  } = config

  if (cmd && !noAuthNeeded.includes(cmd)) {
    console.error('auth err')
    handleAsyncError(assertLoggedIn)(context)
  }
  if (cmd && !noSpaceIdNeeded.includes(cmd)) {
    console.error('space err')
    handleAsyncError(assertSpaceIdProvided)(context)
  }
}

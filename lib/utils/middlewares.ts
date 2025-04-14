import yargs from 'yargs'
import { getContext } from '../context'
import config from '../config'
import { assertLoggedIn, assertSpaceIdProvided } from './assertions'
import { handleAsyncError as handle } from './async'

interface CommandResult {
  cmd: string
}

interface ContextBuildArguments {
  managementToken?: string
  spaceId?: string
  activeSpaceId?: string
  environmentId?: string
  activeEnvironmentId?: string
  insecure?: boolean | string
  host?: string
  rawProxy?: boolean
  proxy?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface Context {
  managementToken?: string
  activeSpaceId?: string
  activeEnvironmentId?: string
  insecure?: boolean
  host?: string
  rawProxy?: boolean
  proxy?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface ContextResult {
  context: Context
}

interface AssertContextParams extends ContextResult {
  cmd?: string
}

export function getCommand(): CommandResult {
  // Access yargs internal context safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yargsContext = (yargs as any).getContext?.() || { fullCommands: [] }
  const cmd = yargsContext.fullCommands?.join(' ') || ''
  return { cmd }
}

export async function buildContext(
  argv: ContextBuildArguments
): Promise<ContextResult> {
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

export async function assertContext(
  params: AssertContextParams
): Promise<void> {
  const { cmd, context } = params
  const { noAuthNeeded, noSpaceIdNeeded } = config

  if (cmd && !noAuthNeeded.includes(cmd)) {
    // We need to use type assertion to get around TypeScript's type checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handle(assertLoggedIn)(context as any)
  }
  if (cmd && !noSpaceIdNeeded.includes(cmd)) {
    // We need to use type assertion to get around TypeScript's type checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handle(assertSpaceIdProvided)(context as any)
  }
}

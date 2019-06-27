import {getContext} from '../context'

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

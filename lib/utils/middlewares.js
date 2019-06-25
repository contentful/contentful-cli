import {getContext} from '../context'

export const buildContext = async (argv) => {
  const {
    managementToken,
    cmaToken,
    spaceId,
    activeSpaceId,
    environmentId,
    activeEnvironmentId,
    host
  } = argv

  const context = await getContext()

  const token = managementToken || cmaToken
  if (token) { context.cmaToken = token }

  const space = spaceId || activeSpaceId
  if (space) { context.activeSpaceId = space }

  const environment = environmentId || activeEnvironmentId
  if (environment) { context.activeEnvironmentId = environment }
  if (!context.activeEnvironmentId) { context.activeEnvironmentId = 'master' }

  if (host) { context.host = host }
  if (!context.host) { context.host = 'api.contentful.com' }

  return {context}
}

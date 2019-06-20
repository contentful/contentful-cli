import {getContext} from '../context'

export const buildContext = async () => {
  const ctx = await getContext()
  return {ctx}
}

export const useFlagsIfAvailable = (argv) => {
  const {cmaToken, spaceId, environmentId, ctx, host} = argv

  if (cmaToken) { ctx.managementToken = cmaToken }
  if (spaceId) { ctx.activeSpaceId = spaceId }

  if (environmentId) { ctx.activeEnvironmentId = environmentId }
  if (!ctx.activeEnvironmentId) { ctx.activeEnvironmentId = 'master' }

  if (host) { ctx.host = host }
  if (!ctx.host) { ctx.host = 'api.contentful.com' }

  return ctx
}

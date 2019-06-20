import {getContext} from '../context'

export const buildContext = async (argv) => {
  const {managementToken, spaceId, environmentId, host} = argv
  const ctx = await getContext()

  if (managementToken) { ctx.cmaToken = managementToken }

  if (spaceId) { ctx.activeSpaceId = spaceId }

  if (environmentId) { ctx.activeEnvironmentId = environmentId }
  if (!ctx.activeEnvironmentId) { ctx.activeEnvironmentId = 'master' }

  if (host) { ctx.host = host }
  if (!ctx.host) { ctx.host = 'api.contentful.com' }

  return {
    ...ctx,
    // overwrite passed args
    environmentId: undefined,
    spaceId: undefined,
    managementToken: undefined
  }
}

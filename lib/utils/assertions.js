import { getContext } from '../context'
import { PreconditionFailedError } from './error'
import { highlightStyle } from './styles'

export async function assertLoggedIn ({managementToken, cmaToken, paramName} = {}) {
  let noToken = !cmaToken && !managementToken
  if (noToken) {
    const context = await getContext()
    noToken = !context.cmaToken
  }
  paramName = paramName || '--management-Token'
  if (noToken) {
    throw new PreconditionFailedError(`You have to be logged in to do this.\nYou can log in via ${highlightStyle('contentful login')}\nOr provide a managementToken via ${paramName} argument`)
  }
}

export async function assertSpaceIdProvided ({spaceId, activeSpaceId} = {}) {
  let noSpaceId = !spaceId && !activeSpaceId
  if (noSpaceId) {
    const context = await getContext()
    noSpaceId = !context.activeSpaceId
  }
  if (noSpaceId) {
    throw new PreconditionFailedError(`You need to provide a space id. You can pass it via the ${highlightStyle('--space-id')} parameter or by running ${highlightStyle('contentful space use')}`)
  }
}

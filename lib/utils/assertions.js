import { getContext } from '../context'
import { PreconditionFailedError } from './error'
import { highlightStyle } from './styles'

export async function assertLoggedIn ({managementToken, paramName} = {}) {
  const context = await getContext()
  paramName = paramName || '--management-Token'
  if (!context.cmaToken && !managementToken) {
    throw new PreconditionFailedError(`You have to be logged in to do this.\nYou can log in via ${highlightStyle('contentful login')}\nOr provide a managementToken via ${paramName} argument`)
  }
}

export async function assertSpaceIdProvided ({spaceId} = {}) {
  const context = await getContext()
  if (!(spaceId || context.activeSpaceId)) {
    throw new PreconditionFailedError(`You need to provide a space id. You can pass it via the ${highlightStyle('--space-id')} parameter or by running ${highlightStyle('contentful space use')}`)
  }
}

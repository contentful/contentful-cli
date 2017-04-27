import { getContext } from '../context'
import { PreconditionFailedError } from './error'
import { highlightStyle } from './styles'

export async function assertLoggedIn () {
  const context = await getContext()
  if (!context.cmaToken) {
    throw new PreconditionFailedError(`You have to be logged in to do this. You can log in via ${highlightStyle('contentful login')}`)
  }
}

export async function assertSpaceIdProvided ({spaceId}) {
  const context = await getContext()
  if (!(spaceId || context.activeSpaceId)) {
    throw new PreconditionFailedError(`You need to provide a space id. You can pass it via the ${highlightStyle('--spaceId')} parameter or by running ${highlightStyle('contentful space use')}`)
  }
}

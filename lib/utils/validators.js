import { getContext } from '../context'
import { highlightStyle } from './styles'
import { PreconditionFailedError } from './error'

export async function checkLoggedIn () {
  const context = await getContext()
  if (!context.cmaToken) {
    throw new PreconditionFailedError(`You have to be logged in to do this. You can log in via ${highlightStyle('contentful login')}`)
  }
}

export async function checkSpaceIdProvided (argv) {
  const context = await getContext()
  if (!(argv.spaceId || context.activeSpaceId)) {
    throw new PreconditionFailedError(`You need to provide a space id. You can pass it via the ${highlightStyle('--spaceId')} parameter or by running ${highlightStyle('contentful space use')}`)
  }
}

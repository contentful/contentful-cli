import { getContext } from '../context'
import { PreconditionFailedError } from './error'
import { highlightStyle } from './styles'

interface AssertLoggedInOptions {
  managementToken?: string
  paramName?: string
}

export async function assertLoggedIn({
  managementToken,
  paramName
}: AssertLoggedInOptions = {}): Promise<void> {
  let noToken = !managementToken
  if (!managementToken) {
    const context = await getContext()
    noToken = !context.managementToken
  }
  paramName = paramName || '--management-token'
  if (noToken) {
    throw new PreconditionFailedError(
      `You have to be logged in to do this.\nYou can log in via ${highlightStyle(
        'contentful login'
      )}\nOr provide a management token via ${paramName} argument`
    )
  }
}

interface AssertSpaceIdProvidedOptions {
  spaceId?: string
  activeSpaceId?: string
}

export async function assertSpaceIdProvided({
  spaceId,
  activeSpaceId
}: AssertSpaceIdProvidedOptions = {}): Promise<void> {
  let noSpaceId = !spaceId && !activeSpaceId
  if (noSpaceId) {
    const context = await getContext()
    noSpaceId = !context.activeSpaceId
  }
  if (noSpaceId) {
    throw new PreconditionFailedError(
      `You need to provide a space id. You can pass it via the ${highlightStyle(
        '--space-id'
      )} parameter or by running ${highlightStyle('contentful space use')}`
    )
  }
}

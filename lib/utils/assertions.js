const { getContext } = require('../context')
const { PreconditionFailedError } = require('./error')
const { highlightStyle } = require('./styles')

async function assertLoggedIn({ managementToken, paramName } = {}) {
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

module.exports.assertLoggedIn = assertLoggedIn

async function assertSpaceIdProvided({ spaceId, activeSpaceId } = {}) {
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

module.exports.assertSpaceIdProvided = assertSpaceIdProvided

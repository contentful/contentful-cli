const { login } = require('../cmds/login')
const { getContext } = require('../context')
const { log, wrappedLog } = require('../utils/log')
const { separator } = require('../utils/text')
const { highlightStyle, codeStyle } = require('../utils/styles')
const { generateNumberEmoji } = require('../utils/emojis')

const { GUIDE_MAX_WIDTH } = require('./helpers')

module.exports = async function loginStep(guideContext) {
  const context = await getContext()
  const { managementToken } = context

  if (!managementToken) {
    guideContext.stepCount++

    const { stepCount } = guideContext

    log(separator(GUIDE_MAX_WIDTH))
    wrappedLog(
      `${generateNumberEmoji(stepCount)} Sign in to a new or existing account`,
      GUIDE_MAX_WIDTH
    )
    log(separator(GUIDE_MAX_WIDTH))
    log()
    wrappedLog(
      `First, we’ll store your access token (CMA token) on your machine in order for the CLI to authenticate write requests against the ${highlightStyle(
        'Content Management API'
      )}.`,
      GUIDE_MAX_WIDTH
    )
    log()
    wrappedLog(
      `We’ll run the ${codeStyle(
        'contentful login'
      )} command which will open a new browser window. In the browser, you’ll find your ${highlightStyle(
        'CMA token'
      )}. Copy/paste your ${highlightStyle('CMA token')} to authenticate.`,
      GUIDE_MAX_WIDTH
    )
    log()

    await login({ context })
  }
}

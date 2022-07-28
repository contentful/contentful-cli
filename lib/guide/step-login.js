import { login } from '../cmds/login.js'
import { getContext } from '../context.js'
import { log, wrappedLog } from '../utils/log.js'
import { separator } from '../utils/text.js'
import { highlightStyle, codeStyle } from '../utils/styles.js'
import { generateNumberEmoji } from '../utils/emojis.js'
import { GUIDE_MAX_WIDTH } from './helpers.js'

export default async function loginStep(guideContext) {
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

import shellescape from 'shell-escape'
import { spaceSeed } from '../cmds/space_cmds/seed.mjs'
import { log, wrappedLog } from '../utils/log.mjs'
import { separator } from '../utils/text.mjs'
import { getContext } from '../context.mjs'
import { highlightStyle, codeStyle } from '../utils/styles.mjs'
import { generateNumberEmoji } from '../utils/emojis.mjs'
import { confirmation } from '../utils/actions.mjs'
import { GUIDE_MAX_WIDTH, AbortedError } from './helpers.mjs'

export default async function seedStep(guideContext) {
  guideContext.stepCount++

  const { stepCount, spaceId, activeGuide } = guideContext

  const seedSpaceCommand = [
    'contentful',
    'space',
    'seed',
    '--template',
    activeGuide.seed,
    '--space-id',
    spaceId
  ]

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(
    `${generateNumberEmoji(
      stepCount
    )} Create your Content model and first Entries`,
    GUIDE_MAX_WIDTH
  )
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(
    `Next, we’ll add blog content to your Space. It will be structured as ${highlightStyle(
      'Persons'
    )} and ${highlightStyle('Blog Posts')}.`
  )
  log()
  wrappedLog(
    `We'll proceed with the following command ${codeStyle(
      shellescape(seedSpaceCommand)
    )}.`,
    GUIDE_MAX_WIDTH
  )
  log()

  const confirmSpaceSeed = await confirmation(
    'Populate the Content model to your Space now?'
  )
  log()

  if (!confirmSpaceSeed) {
    throw new AbortedError()
  }

  const context = await getContext()

  await spaceSeed({
    template: activeGuide.seed,
    yes: true,
    feature: 'guide',
    context: { activeSpaceId: spaceId, ...context }
  })
}

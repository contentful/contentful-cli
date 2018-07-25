import shellescape from 'shell-escape'

import { spaceSeed } from '../space_cmds/seed'
import { log, wrappedLog } from '../../utils/log'
import { separator } from '../../utils/text'
import { highlightStyle, codeStyle } from '../../utils/styles'
import { generateNumberEmoji } from '../../utils/emojis'
import { confirmation } from '../../utils/actions'

import { GUIDE_MAX_WIDTH, AbortedError } from './helpers'

export default async function seedStep (guideContext) {
  guideContext.stepCount++

  const { stepCount, spaceId, activeGuide } = guideContext

  const seedSpaceCommand = ['contentful', 'space', 'seed', '--template', activeGuide.seed, '--space-id', spaceId]

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Create your Content model and first Entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(`Next, we’ll add blog content to your Space. It will be structured as ${highlightStyle('Persons')} and ${highlightStyle('Blog Posts')}.`)
  log()
  wrappedLog(`We'll proceed with the following command ${codeStyle(shellescape(seedSpaceCommand))}.`, GUIDE_MAX_WIDTH)
  log()

  const confirmSpaceSeed = await confirmation('Populate the Content model to your Space now?')
  log()

  if (!confirmSpaceSeed) {
    throw new AbortedError()
  }

  await spaceSeed({
    template: activeGuide.seed,
    spaceId,
    yes: true
  })
}

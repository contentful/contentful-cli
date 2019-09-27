const shellescape = require('shell-escape')

const { spaceSeed } = require('../cmds/space_cmds/seed')
const { log, wrappedLog } = require('../utils/log')
const { separator } = require('../utils/text')
const { getContext } = require('../context')
const { highlightStyle, codeStyle } = require('../utils/styles')
const { generateNumberEmoji } = require('../utils/emojis')
const { confirmation } = require('../utils/actions')

const { GUIDE_MAX_WIDTH, AbortedError } = require('./helpers')

module.exports = async function seedStep(guideContext) {
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

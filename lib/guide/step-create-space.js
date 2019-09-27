const shellescape = require('shell-escape')

const { spaceCreate } = require('../cmds/space_cmds/create')
const { log, wrappedLog } = require('../utils/log')
const { getContext } = require('../context')
const { separator } = require('../utils/text')
const { highlightStyle, codeStyle } = require('../utils/styles')
const { generateNumberEmoji } = require('../utils/emojis')
const { confirmation } = require('../utils/actions')

const { GUIDE_MAX_WIDTH, AbortedError } = require('./helpers')

module.exports = async function createSpaceStep(guideContext) {
  guideContext.stepCount++

  const { stepCount, activeGuide } = guideContext

  const createSpaceCommand = [
    'contentful',
    'space',
    'create',
    '--name',
    activeGuide.name
  ]

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(
    `${generateNumberEmoji(stepCount)} Create a Space to hold your content`,
    GUIDE_MAX_WIDTH
  )
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(
    `${
      stepCount > 1 ? 'Next' : 'First'
    }, we’ll create a Space which is a container for all of your structured content. We’ll create and name the space '${highlightStyle(
      activeGuide.name
    )}' using the command: ${codeStyle(shellescape(createSpaceCommand))}`,
    GUIDE_MAX_WIDTH
  )

  log()
  const confirmSpaceCreate = await confirmation('Create your new Space now?')

  if (!confirmSpaceCreate) {
    throw new AbortedError()
  }

  const context = await getContext()

  const space = await spaceCreate({
    name: activeGuide.name,
    feature: 'guide',
    context
  })

  guideContext.spaceId = space.sys.id
}

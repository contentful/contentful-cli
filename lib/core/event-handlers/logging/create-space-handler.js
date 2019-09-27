const { successEmoji } = require('../../../utils/emojis')
const { highlightStyle } = require('../../../utils/styles')
const { CREATE_SPACE_HANDLER } = require('../../events/scopes')

const createSpaceHandlerLogging = {
  scopes: [CREATE_SPACE_HANDLER],
  messages: {
    error: {},
    info: {
      MULTIPLE_ORG_MEMBERSHIP: () =>
        `\nYour user account is a member of multiple organizations. Please select the organization you would like to add your Space to.\n`
    },
    success: {
      SPACE_CREATED: ({ space }) =>
        `\n${successEmoji} Successfully created space ${highlightStyle(
          space.name
        )} (${highlightStyle(space.sys.id)})`
    }
  }
}

module.exports = createSpaceHandlerLogging

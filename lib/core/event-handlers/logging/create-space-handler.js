import { successEmoji } from '../../../utils/emojis.js'
import { highlightStyle } from '../../../utils/styles.js'
import { CREATE_SPACE_HANDLER } from '../../events/scopes.js'

export default {
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

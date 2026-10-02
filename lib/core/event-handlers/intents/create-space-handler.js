const { CREATE_SPACE_HANDLER } = require('../../events/scopes')
const { prompt } = require('../../../utils/actions')

const createCreateSpaceHandlerIntents = () => {
  const createSpaceHandlerIntents = {
    scopes: [CREATE_SPACE_HANDLER],
    intents: {
      SELECT_ORG: async ({ organizations }) => {
        const answersOrganizationSelection = await prompt(
          [
            {
              type: 'list',
              name: 'organizationId',
              message: 'Please select an organization:',
              choices: organizations
            }
          ],
          {
            hint: 'Pass --organization-id <id> to select an organization non-interactively.'
          }
        )

        return answersOrganizationSelection.organizationId
      }
    }
  }

  return createSpaceHandlerIntents
}

module.exports = createCreateSpaceHandlerIntents

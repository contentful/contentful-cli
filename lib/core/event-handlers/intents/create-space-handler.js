const { CREATE_SPACE_HANDLER } = require('../../events/scopes')
const inquirer = require('inquirer')

const createCreateSpaceHandlerIntents = () => {
  const createSpaceHandlerIntents = {
    scopes: [CREATE_SPACE_HANDLER],
    intents: {
      SELECT_ORG: async ({ organizations }) => {
        const answersOrganizationSelection = await inquirer.prompt([
          {
            type: 'list',
            name: 'organizationId',
            message: 'Please select an organization:',
            choices: organizations
          }
        ])

        return answersOrganizationSelection.organizationId
      }
    }
  }

  return createSpaceHandlerIntents
}

module.exports = createCreateSpaceHandlerIntents

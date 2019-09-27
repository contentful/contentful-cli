const { exportSpace } = require('../../../../lib/cmds/space_cmds/export')

const { version } = require('../../../../package.json')
const { getContext } = require('../../../../lib/context')
const contentfulExport = require('contentful-export')

jest.mock('../../../../lib/context')
jest.mock('contentful-export')

getContext.mockResolvedValue({ managementToken: 'managementToken' })

test('it should pass all args to contentful-export', async () => {
  const stubArgv = {
    context: {
      activeSpaceId: 'spaceId',
      activeEnvironmentId: 'master',
      host: 'api.contentful.com',
      managementToken: 'managementToken'
    },
    includeDrafts: false,
    skipRoles: false,
    skipContentModel: false,
    skipContent: false,
    skipWebhooks: false,
    maxAllowedLimit: 1000,
    saveFile: true,
    useVerboseRenderer: false,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'space-export'
  }
  await exportSpace(stubArgv)
  const result = {
    ...stubArgv,
    environmentId: 'master',
    managementToken: 'managementToken',
    spaceId: 'spaceId',
    host: 'api.contentful.com'
  }
  expect(contentfulExport.mock.calls[0][0]).toEqual(result)
  expect(contentfulExport).toHaveBeenCalledTimes(1)
})

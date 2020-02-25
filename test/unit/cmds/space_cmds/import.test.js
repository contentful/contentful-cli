const { importSpace } = require('../../../../lib/cmds/space_cmds/import')

const { version } = require('../../../../package.json')
const { getContext } = require('../../../../lib/context')
const contentfulImport = require('contentful-import')

jest.mock('../../../../lib/context')
jest.mock('contentful-import')

getContext.mockResolvedValue({ managementToken: 'managementToken' })

test('it should pass all args to contentful-import', async () => {
  const stubArgv = {
    context: {
      activeSpaceId: 'spaceId',
      managementToken: 'managementToken'
    },
    skipContentModel: false,
    skipLocales: false,
    host: 'api.contentful.com',
    skipContentPublishing: false,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'space-import'
  }
  await importSpace(stubArgv)
  const result = {
    ...stubArgv,
    managementToken: 'managementToken',
    spaceId: 'spaceId',
    environmentId: undefined,
    host: undefined
  }
  expect(contentfulImport.mock.calls[0][0]).toEqual(result)
  expect(contentfulImport).toHaveBeenCalledTimes(1)
})

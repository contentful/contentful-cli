import { importSpace } from '../../../../lib/cmds/space_cmds/import'

import { version } from '../../../../package.json'
import { getContext } from '../../../../lib/context'
import contentfulImport from 'contentful-import'

jest.mock('../../../../lib/context')
jest.mock('contentful-import')

const mocks = {
  getContext: getContext as jest.MockedFunction<any>
}

mocks.getContext.mockResolvedValue({ managementToken: 'managementToken' })

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
    skipContentUpdates: true,
    skipAssetUpdates: true,
    uploadAssets: true,
    assetsDirectory: '.',
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'space-import',
    uploadAssets: true,
    assetsDirectory: 'assets'
  }
  await importSpace(stubArgv)
  const result = {
    ...stubArgv,
    managementToken: 'managementToken',
    spaceId: 'spaceId',
    environmentId: undefined,
    host: undefined,
    headers: {},
    skipContentUpdates: true,
    skipAssetUpdates: true,
    uploadAssets: true,
    assetsDirectory: 'assets'
  }
  expect(contentfulImport.mock.calls[0][0]).toEqual(result)
  expect(contentfulImport).toHaveBeenCalledTimes(1)
})

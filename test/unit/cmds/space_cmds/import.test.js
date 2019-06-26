import { importSpace } from '../../../../lib/cmds/space_cmds/import'

import { version } from '../../../../package.json'
import { getContext } from '../../../../lib/context'
import contentfulImport from 'contentful-import'

jest.mock('../../../../lib/context')
jest.mock('contentful-import')

getContext.mockResolvedValue({ cmaToken: 'managementToken' })

test('it should pass all args to contentful-import', async () => {
  const stubArgv = {
    context: {
      activeSpaceId: 'spaceId',
      cmaToken: 'managementToken'
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
    spaceId: 'spaceId'
  }
  expect(contentfulImport.mock.calls[0][0]).toEqual(result)
  expect(contentfulImport).toHaveBeenCalledTimes(1)
})

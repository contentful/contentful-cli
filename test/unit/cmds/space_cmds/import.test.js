import { importSpace } from '../../../../lib/cmds/space_cmds/import'

import { version } from '../../../../package.json'
import { getContext } from '../../../../lib/context'
import contentfulImport from 'contentful-import'

jest.mock('../../../../lib/context')
jest.mock('contentful-import')

getContext.mockResolvedValue({ cmaToken: 'managementToken' })

test('it should pass all args to contentful-import', async () => {
  const stubArgv = {
    skipContentModel: false,
    skipLocales: false,
    host: 'api.contentful.com',
    skipContentPublishing: false,
    managementToken: 'managementToken',
    managementApplication: `contentful.cli/${version}`,
    spaceId: 'spaceId',
    managementFeature: 'space-import'
  }
  await importSpace(stubArgv)
  expect(contentfulImport.mock.calls[0][0]).toEqual(stubArgv)
  expect(contentfulImport).toHaveBeenCalledTimes(1)
})

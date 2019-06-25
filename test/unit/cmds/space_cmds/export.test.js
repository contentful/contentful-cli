import { exportSpace } from '../../../../lib/cmds/space_cmds/export'

import { version } from '../../../../package.json'
import { getContext } from '../../../../lib/context'
import contentfulExport from 'contentful-export'

jest.mock('../../../../lib/context')
jest.mock('contentful-export')

getContext.mockResolvedValue({ cmaToken: 'managementToken' })

test('it should pass all args to contentful-export', async () => {
  const stubArgv = {
    activeSpaceId: 'spaceId',
    activeEnvironmentId: 'master',
    cmaToken: 'managementToken',
    host: 'api.contentful.com',
    includeDrafts: false,
    skipRoles: false,
    skipContentModel: false,
    skipContent: false,
    skipWebhooks: false,
    maxAllowedLimit: 1000,
    saveFile: true,
    useVerboseRenderer: false,
    managementApplication: `contentful.cli/${version}`,
    managementToken: 'managementToken',
    managementFeature: 'space-export'
  }
  await exportSpace(stubArgv)
  const result = {
    ...stubArgv,
    environmentId: 'master',
    managementToken: 'managementToken',
    spaceId: 'spaceId'
  }
  expect(contentfulExport.mock.calls[0][0]).toEqual(result)
  expect(contentfulExport).toHaveBeenCalledTimes(1)
})

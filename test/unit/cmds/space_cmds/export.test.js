import { version } from '../../../../package.json'
import { stub } from 'sinon'
import {
  exportSpace,
  __RewireAPI__ as exportRewireAPI
} from '../../../../lib/cmds/space_cmds/export'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'
const contentfulExportStub = stub().returns(Promise.resolve())

beforeAll(() => {
  setContext({cmaToken: 'managementToken'})
  exportRewireAPI.__Rewire__('runContentfulExport', contentfulExportStub)
})

afterAll(() => {
  emptyContext()
  exportRewireAPI.__ResetDependency__('runContentfulExport')
})
test('it should pass all args to contentful-export', async () => {
  const stubArgv = {
    spaceId: 'spaceId',
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
  expect(contentfulExportStub.args[0][0]).toEqual(stubArgv)
  expect(contentfulExportStub.callCount).toBe(1)
})

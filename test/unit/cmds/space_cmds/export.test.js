import test from 'ava'
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

test.before(() => {
  setContext({cmaToken: 'managementToken'})
  exportRewireAPI.__Rewire__('runContentfulExport', contentfulExportStub)
})

test.after(() => {
  emptyContext()
  exportRewireAPI.__ResetDependency__('runContentfulExport')
})
test('it should pass all args to contentful-export', async (t) => {
  const stubArgv = {
    spaceId: 'spaceId',
    includeDrafts: false,
    skipRoles: false,
    skipContentModel: false,
    skipContent: false,
    skipWebhooks: false,
    maxAllowedLimit: 1000,
    saveFile: true,
    useVerboseRenderer: false,
    managementToken: 'managementToken'
  }
  await exportSpace(stubArgv)
  // this will be added by the export cmd
  stubArgv.managementHeaders = {'X-Contentful-Beta-Content-Type-Migration': 'true'}
  t.deepEqual(contentfulExportStub.args[0][0], stubArgv)
  t.is(contentfulExportStub.callCount, 1)
})

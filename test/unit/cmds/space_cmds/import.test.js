import test from 'ava'
import { version } from '../../../../package.json'
import { stub } from 'sinon'
import {
  importSpace,
  __RewireAPI__ as importRewireAPI
} from '../../../../lib/cmds/space_cmds/import'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'

const contentfulImportStub = stub().returns(Promise.resolve())

test.before(() => {
  setContext({cmaToken: 'managementToken'})
  importRewireAPI.__Rewire__('runContentfulImport', contentfulImportStub)
})

test.after(() => {
  emptyContext()
  importRewireAPI.__ResetDependency__('runContentfulImport')
})
test('it should pass all args to contentful-import', async (t) => {
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
  t.deepEqual(contentfulImportStub.args[0][0], stubArgv)
  t.is(contentfulImportStub.callCount, 1)
})

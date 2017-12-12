import test from 'ava'
import { stub } from 'sinon'

import {
  handler,
  __RewireAPI__ as getRewireAPI
} from '../../../../lib/cmds/extension_cmds/get'

import {
  __RewireAPI__ as logRewireAPI
} from '../../../../lib/cmds/extension_cmds/utils/log-as-table'

const logStub = stub()
const getUiExtensionStub = stub()

const mockExtension = {
  extension: {
    name: 'Widget',
    fieldTypes: [ { type: 'Symbol' }, { type: 'Array', items: { type: 'Symbol' } } ],
    src: 'https://awesome.extension'
  },
  sys: { id: '123', version: 3 }
}

test.before(() => {
  const fakeClient = {
    getSpace: stub().returns({
      getUiExtension: getUiExtensionStub.resolves(mockExtension)
    })
  }
  const createManagementClientStub = stub().returns(fakeClient)

  getRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  logRewireAPI.__Rewire__('log', logStub)
})

test.after.always(() => {
  getRewireAPI.__ResetDependency__('createManagementClient')
  logRewireAPI.__ResetDependency__('log')
})

test('Calls getUiExtension() with ID', async (t) => {
  await handler({ spaceId: 'space1', id: 'widget1' })

  t.true(getUiExtensionStub.calledWith('widget1'))
})

test('Logs extension data', async (t) => {
  await handler({ spaceId: 'space1', id: 'widget1' })

  const outputValues = [ '123', 'Widget', 'Symbol, Symbols', 'https://awesome.extension' ]

  outputValues.forEach(str => {
    t.true(logStub.lastCall.args[0].includes(str))
  })
})

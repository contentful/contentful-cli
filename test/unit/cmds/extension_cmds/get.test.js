import { stub } from 'sinon'

import {
  handler,
  __RewireAPI__ as getRewireAPI
} from '../../../../lib/cmds/extension_cmds/get'
import {
  emptyContext,
  setContext
} from '../../../../lib/context'
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

const environmentStub = stub().resolves({
  getUiExtension: getUiExtensionStub.resolves(mockExtension)
})
beforeAll(() => {
  const fakeClient = {
    getSpace: stub().resolves({getEnvironment: environmentStub})
  }
  const createManagementClientStub = stub().returns(fakeClient)

  emptyContext()
  setContext({
    cmaToken: 'mockedToken',
    activeSpaceId: 'someSpaceId'
  })

  getRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  logRewireAPI.__Rewire__('log', logStub)
})

afterAll(() => {
  getRewireAPI.__ResetDependency__('createManagementClient')
  logRewireAPI.__ResetDependency__('log')
})

test('Calls getUiExtension() with ID', async () => {
  await handler({ spaceId: 'space1', id: 'widget1' })

  expect(getUiExtensionStub.calledWith('widget1')).toBe(true)
})

test('Logs extension data', async () => {
  await handler({ spaceId: 'space1', id: 'widget1' })

  const outputValues = [ '123', 'Widget', 'Symbol, Symbols', 'https://awesome.extension' ]

  outputValues.forEach(str => {
    expect(logStub.lastCall.args[0].includes(str)).toBe(true)
  })
})

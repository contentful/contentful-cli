import { stub } from 'sinon'

import {
  handler,
  __RewireAPI__ as rewireAPI
} from '../../../../lib/cmds/extension_cmds/list'
import {
  emptyContext,
  setContext
} from '../../../../lib/context'

const logStub = stub()
const getEnvStub = stub()
const getSpaceStub = stub().resolves({getEnvironment: getEnvStub})

const mockExtensions = {
  items: [
    {
      extension: {
        name: 'Widget',
        fieldTypes: [ { type: 'Symbol' }, { type: 'Array', items: { type: 'Symbol' } } ],
        src: 'https://awesome.extension'
      },
      sys: { id: '123', version: 7 }
    }, {
      extension: {
        name: 'Widget 2',
        fieldTypes: [ { type: 'Entry' }, { type: 'Number' } ],
        src: 'https://awesome.extension'
      },
      sys: { id: '456', version: 8 }
    }
  ]
}

beforeAll(() => {
  const fakeClient = {
    getSpace: getSpaceStub
  }

  getEnvStub.withArgs('env').resolves({ getUiExtensions: stub().resolves(mockExtensions) })
  getEnvStub.withArgs('empty').resolves({ getUiExtensions: stub().resolves({ items: [] }) })

  const createManagementClientStub = stub().returns(fakeClient)

  emptyContext()
  setContext({
    cmaToken: 'mockedToken',
    activeSpaceId: 'someSpaceId'
  })

  rewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  rewireAPI.__Rewire__('log', logStub)
})

afterAll(() => {
  rewireAPI.__ResetDependency__('createManagementClient')
  rewireAPI.__ResetDependency__('log')
})

test('Lists extensions', async () => {
  await handler({spaceId: 'space', environmentId: 'env'})

  const outputValues = [ 'Widget', '123', '7', 'Widget 2', '456', '8' ]

  outputValues.forEach(str => {
    expect(logStub.lastCall.args[0].includes(str)).toBe(true)
  })
})

test('Displays message if list is empty', async () => {
  await handler({spaceId: 'space', environmentId: 'empty'})

  expect(logStub.calledWith('No extensions found')).toBe(true)
})

import test from 'ava'
import { stub } from 'sinon'

import {
  handler,
  __RewireAPI__ as rewireAPI
} from '../../../../lib/cmds/extension_cmds/list'

const logStub = stub()
const getSpaceStub = stub()

const mockExtensions = {
  items: [
    {
      extension: {
        name: 'Widget',
        fieldTypes: [ { type: 'Symbol' }, { type: 'Array', items: { type: 'Symbol' } } ],
        src: 'https://awesome.extension'
      },
      sys: { id: '123', version: 3 }
    }, {
      extension: {
        name: 'Widget 2',
        fieldTypes: [ { type: 'Entry' }, { type: 'Number' } ],
        src: 'https://awesome.extension'
      },
      sys: { id: '456', version: 1 }
    }
  ]
}

test.before(() => {
  const fakeClient = {
    getSpace: getSpaceStub
  }

  getSpaceStub.withArgs('space').returns({ getUiExtensions: stub().returns(mockExtensions) })
  getSpaceStub.withArgs('empty-space').returns({ getUiExtensions: stub().returns({ items: [] }) })

  const createManagementClientStub = stub().returns(fakeClient)

  rewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  rewireAPI.__Rewire__('log', logStub)
})

test.after.always(() => {
  rewireAPI.__ResetDependency__('createManagementClient')
  rewireAPI.__ResetDependency__('log')
})

test('Lists extensions', async (t) => {
  await handler({spaceId: 'space'})

  const outputValues = [ 'Widget', '123', 'Widget 2', '456' ]

  outputValues.forEach(str => {
    t.true(logStub.lastCall.args[0].includes(str))
  })
})

test('Displays message if list is empty', async (t) => {
  await handler({spaceId: 'empty-space'})

  t.true(logStub.calledWith('No extensions found'))
})

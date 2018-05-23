import test from 'ava'
import { stub } from 'sinon'

import {
  environmentList,
  __RewireAPI__ as environmentListRewireAPI
} from '../../../../../lib/cmds/space_cmds/environment_cmds/list'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { PreconditionFailedError } from '../../../../../lib/utils/error'

const environmentData = {
  name: 'environment name',
  sys: {
    id: 'environmentId',
    status: {
      sys: {
        id: 'ready'
      }
    }
  }
}

const getEnvironmentsStub = stub().returns({
  items: [environmentData]
})
const fakeClient = {
  getSpace: stub().returns({
    getEnvironments: getEnvironmentsStub
  })
}
const createManagementClientStub = stub().returns(fakeClient)

test.before(() => {
  environmentListRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

test.after.always(() => {
  environmentListRewireAPI.__ResetDependency__('createManagementClient')
})

test.afterEach.always((t) => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  getEnvironmentsStub.resetHistory()
})

test.serial('list environments - requires space id', async (t) => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const error = await t.throws(environmentList({}), PreconditionFailedError, 'throws error')
  t.truthy(error.message.includes('You need to provide a space id'), 'throws space id required in error')
  t.true(createManagementClientStub.notCalled, 'did not create client')
  t.true(getEnvironmentsStub.notCalled, 'did not try to get environment')
})

test.serial('list environments', async (t) => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await environmentList({
    spaceId: 'someSpaceID'
  })
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.getSpace.calledOnce, 'loaded space')
  t.true(getEnvironmentsStub.calledOnce, 'loaded environments')
})

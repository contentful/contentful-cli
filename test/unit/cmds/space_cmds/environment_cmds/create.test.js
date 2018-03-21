import test from 'ava'
import { stub } from 'sinon'

import {
  environmentCreate,
  __RewireAPI__ as environmentCreateRewireAPI
} from '../../../../../lib/cmds/space_cmds/environment_cmds/create'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { PreconditionFailedError } from '../../../../../lib/utils/error'

const environmentData = {
  name: 'environment name',
  sys: {
    id: 'environmentId'
  }
}

const createEnvironmentWithIdStub = stub().returns(environmentData)
const fakeClient = {
  getSpace: stub().returns({
    createEnvironmentWithId: createEnvironmentWithIdStub
  })
}
const createManagementClientStub = stub().returns(fakeClient)

test.before(() => {
  environmentCreateRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

test.after.always(() => {
  environmentCreateRewireAPI.__ResetDependency__('createManagementClient')
})

test.afterEach.always((t) => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  createEnvironmentWithIdStub.resetHistory()
})

test.serial('create environment - requires space id', async (t) => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const error = await t.throws(environmentCreate({}), PreconditionFailedError, 'throws error')
  t.truthy(error.message.includes('You need to provide a space id'), 'throws space id required in error')
  t.true(createManagementClientStub.notCalled, 'did not create client')
  t.true(createEnvironmentWithIdStub.notCalled, 'did not try to create environment with id')
})

test.serial('create new environment with id', async (t) => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await environmentCreate({
    spaceId: 'someSpaceID',
    environmentId: 'test'
  })
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.getSpace.calledOnce, 'loaded space')
  t.true(createEnvironmentWithIdStub.calledOnce, 'did try to create environment with id')
  t.is(createEnvironmentWithIdStub.args[0][0], 'test', 'with correct payload')
  t.deepEqual(createEnvironmentWithIdStub.args[0][1], {}, 'with correct payload')
})

test.serial('create new environment with id and name', async (t) => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await environmentCreate({
    spaceId: 'someSpaceID',
    environmentId: 'test',
    name: 'test'
  })
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.getSpace.calledOnce, 'loaded space')
  t.true(createEnvironmentWithIdStub.calledOnce, 'did try to create environment with id')
  t.is(createEnvironmentWithIdStub.args[0][0], 'test', 'with correct payload')
  t.deepEqual(createEnvironmentWithIdStub.args[0][1], { name: 'test' }, 'with correct payload')
})

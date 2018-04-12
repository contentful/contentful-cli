import test from 'ava'
import { stub } from 'sinon'

import {
  environmentDelete,
  __RewireAPI__ as environmentDeleteRewireAPI
} from '../../../../../lib/cmds/space_cmds/environment_cmds/delete'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { PreconditionFailedError } from '../../../../../lib/utils/error'

const deleteEnvironmentStub = stub()
const environmentData = {
  name: 'environment name',
  sys: {
    id: 'environmentId'
  },
  delete: deleteEnvironmentStub
}

const getEnvironmentStub = stub().returns(environmentData)
const fakeClient = {
  getSpace: stub().returns({
    getEnvironment: getEnvironmentStub
  })
}
const createManagementClientStub = stub().returns(fakeClient)

test.before(() => {
  environmentDeleteRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

test.after.always(() => {
  environmentDeleteRewireAPI.__ResetDependency__('createManagementClient')
})

test.afterEach.always((t) => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  getEnvironmentStub.resetHistory()
  deleteEnvironmentStub.resetHistory()
})

test.serial('delete environment - requires space id', async (t) => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const error = await t.throws(environmentDelete({}), PreconditionFailedError, 'throws error')
  t.truthy(error.message.includes('You need to provide a space id'), 'throws space id required in error')
  t.true(createManagementClientStub.notCalled, 'did not create client')
  t.true(getEnvironmentStub.notCalled, 'did not try to get environment')
  t.true(deleteEnvironmentStub.notCalled, 'did not try to delete environment')
})

test.serial('delete environment', async (t) => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await environmentDelete({
    spaceId: 'someSpaceID',
    environmentId: 'someEnvironmentID'
  })
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.getSpace.calledOnce, 'loaded space')
  t.true(getEnvironmentStub.calledOnce, 'loaded environment')
  t.is(getEnvironmentStub.args[0][0], 'someEnvironmentID', 'with correct environment id')
  t.true(deleteEnvironmentStub.calledOnce, 'deleted environment')
})

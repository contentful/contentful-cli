import { stub } from 'sinon'

import {
  environmentDelete,
  __RewireAPI__ as environmentDeleteRewireAPI
} from '../../../../../lib/cmds/space_cmds/environment_cmds/delete'
import {
  emptyContext,
  setContext,
  getContext
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

beforeAll(() => {
  environmentDeleteRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

afterAll(() => {
  environmentDeleteRewireAPI.__ResetDependency__('createManagementClient')
})

afterEach(() => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  getEnvironmentStub.resetHistory()
  deleteEnvironmentStub.resetHistory()
})

test('delete environment - requires space id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  try {
    await expect(environmentDelete({})).rejects.toThrow(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You need to provide a space id')).toBeTruthy()
    expect(createManagementClientStub.notCalled).toBe(true)
    expect(getEnvironmentStub.notCalled).toBe(true)
    expect(deleteEnvironmentStub.notCalled).toBe(true)
  }
})

test('delete environment', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await environmentDelete({
    spaceId: 'someSpaceID',
    environmentId: 'someEnvironmentID'
  })
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.getSpace.calledOnce).toBe(true)
  expect(getEnvironmentStub.calledOnce).toBe(true)
  expect(getEnvironmentStub.args[0][0]).toBe('someEnvironmentID')
  expect(deleteEnvironmentStub.calledOnce).toBe(true)
})

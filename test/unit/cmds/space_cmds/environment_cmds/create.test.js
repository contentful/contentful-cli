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

beforeAll(() => {
  environmentCreateRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

afterAll(() => {
  environmentCreateRewireAPI.__ResetDependency__('createManagementClient')
})

afterEach(() => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  createEnvironmentWithIdStub.resetHistory()
})

test('create environment - requires space id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const error = await expect(environmentCreate({})).toThrowError(PreconditionFailedError)
  expect(error.message.includes('You need to provide a space id')).toBeTruthy()
  expect(createManagementClientStub.notCalled).toBe(true)
  expect(createEnvironmentWithIdStub.notCalled).toBe(true)
})

test('create new environment with id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await environmentCreate({
    spaceId: 'someSpaceID',
    environmentId: 'test'
  })
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.getSpace.calledOnce).toBe(true)
  expect(createEnvironmentWithIdStub.calledOnce).toBe(true)
  expect(createEnvironmentWithIdStub.args[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.args[0][1]).toEqual({})
})

test('create new environment with id and name', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await environmentCreate({
    spaceId: 'someSpaceID',
    environmentId: 'test',
    name: 'test'
  })
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.getSpace.calledOnce).toBe(true)
  expect(createEnvironmentWithIdStub.calledOnce).toBe(true)
  expect(createEnvironmentWithIdStub.args[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.args[0][1]).toEqual({ name: 'test' })
})

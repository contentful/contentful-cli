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

beforeAll(() => {
  environmentListRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

afterAll(() => {
  environmentListRewireAPI.__ResetDependency__('createManagementClient')
})

afterEach(() => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  getEnvironmentsStub.resetHistory()
})

test('list environments - requires space id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const error = await expect(environmentList({})).toThrowError(PreconditionFailedError)
  expect(error.message.includes('You need to provide a space id')).toBeTruthy()
  expect(createManagementClientStub.notCalled).toBe(true)
  expect(getEnvironmentsStub.notCalled).toBe(true)
})

test('list environments', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await environmentList({
    spaceId: 'someSpaceID'
  })
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.getSpace.calledOnce).toBe(true)
  expect(getEnvironmentsStub.calledOnce).toBe(true)
})

import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  spaceCreate,
  __RewireAPI__ as spaceCreateRewireAPI
} from '../../../../lib/cmds/space_cmds/create'
import {
  emptyContext,
  setContext
} from '../../../../lib/context'
import { PreconditionFailedError } from '../../../../lib/utils/error'

const getOrganizationsStub = stub()
const promptStub = stub(inquirer, 'prompt').returns({organizationId: 'mockedOrgTwo'})
const createSpaceStub = stub().returns({
  name: 'Mocked space name',
  sys: {
    id: 'MockedSpaceId'
  }
})

const fakeClient = {
  createSpace: createSpaceStub,
  getOrganizations: getOrganizationsStub
}
const createManagementClientStub = stub().returns(fakeClient)

beforeAll(() => {
  spaceCreateRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  spaceCreateRewireAPI.__Rewire__('inquirer', inquirer)
})

afterAll(() => {
  spaceCreateRewireAPI.__ResetDependency__('createManagementClient')
})

beforeEach(() => {
  getOrganizationsStub.returns({
    items: [
      {
        name: 'Mocked Org #1',
        sys: {
          id: 'mockedOrgOne'
        }
      }
    ]
  })
})

afterEach(() => {
  fakeClient.createSpace.resetHistory()
  createManagementClientStub.resetHistory()
  getOrganizationsStub.resetHistory()
  promptStub.resetHistory()
})

test('create space with single org user', async () => {
  const spaceData = {
    name: 'space name'
  }
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await spaceCreate(spaceData)
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.createSpace.calledOnce).toBe(true)
  expect(fakeClient.createSpace.args[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.args[0][1]).toBe(undefined)
  expect(promptStub.notCalled).toBe(true)
})

test('create space with multi org user', async () => {
  const spaceData = {
    name: 'space name'
  }
  getOrganizationsStub.returns({
    items: [
      {
        name: 'Mocked Org #1',
        sys: {
          id: 'mockedOrgOne'
        }
      },
      {
        name: 'Mocked Org #2',
        sys: {
          id: 'mockedOrgTwo'
        }
      }
    ]
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await spaceCreate(spaceData)
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.createSpace.calledOnce).toBe(true)
  expect(fakeClient.createSpace.args[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.args[0][1]).toBe('mockedOrgTwo')
  expect(promptStub.called).toBe(true)
})

test('create space with passed organization id', async () => {
  const spaceData = {
    name: 'space name',
    organizationId: 'mockedOrganizationId'
  }
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await spaceCreate(spaceData)
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.createSpace.calledOnce).toBe(true)
  expect(fakeClient.createSpace.args[0][0]).toEqual({name: spaceData.name})
  expect(fakeClient.createSpace.args[0][1]).toBe('mockedOrganizationId')
  expect(promptStub.notCalled).toBe(true)
})

test('create space - fails when not logged in', async () => {
  emptyContext()
  setContext({
    cmaToken: null
  })
  const error = await expect(spaceCreate({})).toThrowError(PreconditionFailedError)
  expect(error.message.includes('You have to be logged in to do this')).toBeTruthy()
  expect(createManagementClientStub.notCalled).toBe(true)
  expect(promptStub.notCalled).toBe(true)
})

test('create space - throws error when sth goes wrong', async () => {
  const errorMessage = 'Unable to create space because of reasons'
  fakeClient.createSpace.reset()
  fakeClient.createSpace.throws(new Error(errorMessage))
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await expect(spaceCreate({})).toThrowError(errorMessage)
  expect(fakeClient.createSpace.calledOnce).toBe(true)
  expect(promptStub.notCalled).toBe(true)
})

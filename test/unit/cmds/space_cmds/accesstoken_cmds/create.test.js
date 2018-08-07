import { stub } from 'sinon'

import {
  accessTokenCreate,
  __RewireAPI__ as accessTokenCreateRewireAPI
} from '../../../../../lib/cmds/space_cmds/accesstoken_cmds/create'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { PreconditionFailedError } from '../../../../../lib/utils/error'

const mockedAccessTokenData = {
  name: 'access token name',
  description: 'some example description'
}

const createApiKeyStub = stub().returns(mockedAccessTokenData)
const getApiKeysStub = stub()
const fakeClient = {
  getSpace: stub().returns({
    createApiKey: createApiKeyStub,
    getApiKeys: getApiKeysStub
  })
}
const createManagementClientStub = stub().returns(fakeClient)

beforeAll(() => {
  accessTokenCreateRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

afterAll(() => {
  accessTokenCreateRewireAPI.__ResetDependency__('createManagementClient')
})

afterEach(() => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  createApiKeyStub.resetHistory()
  getApiKeysStub.reset()
})

test('create new access token', async () => {
  getApiKeysStub.returns({
    items: []
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await accessTokenCreate({
    ...mockedAccessTokenData,
    spaceId: 'some-space-id'
  })
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.getSpace.calledOnce).toBe(true)
  expect(createApiKeyStub.calledOnce).toBe(true)
  expect(createApiKeyStub.args[0][0]).toEqual(mockedAccessTokenData)
})

test('return existing access token', async () => {
  getApiKeysStub.returns({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await accessTokenCreate({
    ...mockedAccessTokenData,
    spaceId: 'some-space-id'
  })
  expect(result).toBeTruthy()
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.getSpace.calledOnce).toBe(true)
  expect(createApiKeyStub.called).toBe(false)
})

test('create access token - fails when not logged in', async () => {
  getApiKeysStub.returns({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: null
  })
  try {
    await expect(accessTokenCreate({
      spaceId: 'some-space-id'
    })).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You have to be logged in to do this')).toBeTruthy()
    expect(createManagementClientStub.notCalled).toBe(true)
    expect(createApiKeyStub.notCalled).toBe(true)
  }
})

test('create access token - requires space id', async () => {
  getApiKeysStub.returns({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  try {
    await expect(accessTokenCreate({})).rejects.toThrowError(PreconditionFailedError)
  } catch (e) {
    expect(error.message.includes('You need to provide a space id')).toBeTruthy()
    expect(createManagementClientStub.notCalled).toBe(true)
    expect(createApiKeyStub.notCalled).toBe(true)
  }
})

test('create access token - throws error when sth goes wrong', async () => {
  const errorMessage = 'Unable to create access token because of reasons'
  getApiKeysStub.reset()
  getApiKeysStub.throws(new Error(errorMessage))
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  try {
    await expect(accessTokenCreate({
      spaceId: 'some-space-id'
    })).rejects.toThrowError(errorMessage)
  } catch (e) {}
  expect(createManagementClientStub.calledOnce).toBe(true)
  expect(fakeClient.getSpace.calledOnce).toBe(true)
  expect(createApiKeyStub.called).toBe(false)
})

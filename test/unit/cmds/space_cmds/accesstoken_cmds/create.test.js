import { accessTokenCreate } from '../../../../../lib/cmds/space_cmds/accesstoken_cmds/create'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'

jest.mock('../../../../../lib/utils/contentful-clients')

const mockedAccessTokenData = {
  name: 'access token name',
  description: 'some example description'
}
const createApiKeyStub = jest.fn().mockResolvedValue(mockedAccessTokenData)
const getApiKeysStub = jest.fn()

const fakeClient = {
  getSpace: async () => ({
    createApiKey: createApiKeyStub,
    getApiKeys: getApiKeysStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

afterEach(() => {
  createApiKeyStub.mockClear()
  getApiKeysStub.mockClear()
  createManagementClient.mockClear()
})

test('create new access token', async () => {
  getApiKeysStub.mockResolvedValue({
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
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub.mock.calls[0][0]).toEqual(mockedAccessTokenData)
})

test('return existing access token', async () => {
  getApiKeysStub.mockResolvedValue({
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
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub).not.toHaveBeenCalled()
})

test('create access token - fails when not logged in', async () => {
  getApiKeysStub.mockResolvedValue({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: null
  })
  await expect(accessTokenCreate({
    spaceId: 'some-space-id'
  })).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(createApiKeyStub).not.toHaveBeenCalled()
})

test('create access token - requires space id', async () => {
  getApiKeysStub.mockResolvedValue({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await expect(accessTokenCreate({})).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(createApiKeyStub).not.toHaveBeenCalled()
})

test('create access token - throws error when sth goes wrong', async () => {
  const errorMessage = 'Unable to create access token because of reasons'
  getApiKeysStub.mockRejectedValueOnce(new Error(errorMessage))
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await expect(accessTokenCreate({
    spaceId: 'some-space-id'
  })).rejects.toThrowError(errorMessage)
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub).not.toHaveBeenCalled()
})

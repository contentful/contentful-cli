const {
  accessTokenCreate
} = require('../../../../../lib/cmds/space_cmds/accesstoken_cmds/create.mjs')
const { getContext } = require('../../../../../lib/context.mjs')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients.mjs')

jest.mock('../../../../../lib/context.mjs')
jest.mock('../../../../../lib/utils/contentful-clients.mjs')

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

getContext.mockResolvedValue({
  managementToken: 'mockedToken'
})

afterEach(() => {
  createApiKeyStub.mockClear()
  getApiKeysStub.mockClear()
  createManagementClient.mockClear()
})

test('create new access token', async () => {
  getApiKeysStub.mockResolvedValue({
    items: []
  })
  const result = await accessTokenCreate({
    ...mockedAccessTokenData,
    context: {
      activeSpaceId: 'some-space-id'
    }
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub.mock.calls[0][0]).toEqual(mockedAccessTokenData)
})

test('create new access token with specified environment', async () => {
  const specificEnvironmentAccessToken = {
    name: 'access token name',
    description: 'some example description',
    environments: [
      {
        sys: {
          id: 'test-env',
          linkType: 'Environment',
          type: 'Link'
        }
      }
    ]
  }

  getApiKeysStub.mockResolvedValue({
    items: []
  })
  const result = await accessTokenCreate({
    ...mockedAccessTokenData,
    environment: 'test-env',
    context: {
      activeSpaceId: 'some-space-id'
    }
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub.mock.calls[0][0]).toEqual(
    specificEnvironmentAccessToken
  )
})

test('return existing access token', async () => {
  getApiKeysStub.mockResolvedValue({
    items: [mockedAccessTokenData]
  })
  const result = await accessTokenCreate({
    ...mockedAccessTokenData,
    context: {
      activeSpaceId: 'some-space-id'
    }
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub).not.toHaveBeenCalled()
})

test('create access token - throws error when sth goes wrong', async () => {
  const errorMessage = 'Unable to create access token because of reasons'
  getApiKeysStub.mockRejectedValueOnce(new Error(errorMessage))
  await expect(
    accessTokenCreate({
      context: {
        activeSpaceId: 'some-space-id'
      }
    })
  ).rejects.toThrowError(errorMessage)
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createApiKeyStub).not.toHaveBeenCalled()
})

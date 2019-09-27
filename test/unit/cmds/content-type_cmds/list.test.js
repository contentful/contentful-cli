const { handler } = require('../../../../lib/cmds/content-type_cmds/list')
const { log } = require('../../../../lib/utils/log')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')

const mockContentTypes = [
  {
    name: 'content type name',
    sys: {
      id: 'mockedMasterCT',
      environment: {
        sys: {
          id: 'master'
        }
      }
    }
  },
  {
    name: 'content type name',
    sys: {
      id: 'mockedDevelopCT',
      environment: {
        sys: {
          id: 'develop'
        }
      }
    }
  },
  {
    name: 'content type name',
    sys: {
      id: 'mockedTestCT',
      environment: {
        sys: {
          id: 'test'
        }
      }
    }
  }
]

const getContentTypesSub = jest.fn().mockResolvedValue({
  items: mockContentTypes
})

const fakeClient = {
  getSpace: async () => ({
    getEnvironment: async () => ({
      getContentTypes: getContentTypesSub
    })
  })
}
createManagementClient.mockResolvedValue(fakeClient)

afterEach(() => {
  createManagementClient.mockClear()
  getContentTypesSub.mockClear()
  log.mockClear()
})

test('List content types from default environment, "master"', async () => {
  await handler({
    context: {
      managementToken: 'mockedToken',
      activeSpaceId: 'someSpaceId',
      activeEnvironmentId: 'master'
    }
  })

  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getContentTypesSub).toHaveBeenCalledTimes(1)

  expect(log.mock.calls[0][0]).toContain(
    mockContentTypes[0].sys.environment.sys.id
  )
  expect(log.mock.calls[0][0]).not.toContain(
    mockContentTypes[1].sys.environment.sys.id
  )
  expect(log.mock.calls[0][0]).not.toContain(
    mockContentTypes[2].sys.environment.sys.id
  )

  expect(log.mock.calls[1][0]).toContain(mockContentTypes[0].name)
  expect(log.mock.calls[1][0]).toContain(mockContentTypes[0].sys.id)
})

test('List content types based on active environment if available', async () => {
  await handler({
    context: {
      managementToken: 'mockedToken',
      activeSpaceId: 'someSpaceId',
      activeEnvironmentId: 'develop'
    }
  })

  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getContentTypesSub).toHaveBeenCalledTimes(1)

  expect(log.mock.calls[0][0]).not.toContain(
    mockContentTypes[0].sys.environment.sys.id
  )
  expect(log.mock.calls[0][0]).toContain(
    mockContentTypes[1].sys.environment.sys.id
  )
  expect(log.mock.calls[0][0]).not.toContain(
    mockContentTypes[2].sys.environment.sys.id
  )

  expect(log.mock.calls[1][0]).toContain(mockContentTypes[1].name)
  expect(log.mock.calls[1][0]).toContain(mockContentTypes[1].sys.id)
})

test('List content types based on environment passed if --environment-id option is used', async () => {
  const stubArgv = {
    context: {
      managementToken: 'mockedToken',
      activeSpaceId: 'someSpaceId',
      activeEnvironmentId: 'test'
    }
  }

  await handler(stubArgv)

  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getContentTypesSub).toHaveBeenCalledTimes(1)

  expect(log.mock.calls[0][0]).not.toContain(
    mockContentTypes[0].sys.environment.sys.id
  )
  expect(log.mock.calls[0][0]).not.toContain(
    mockContentTypes[1].sys.environment.sys.id
  )
  expect(log.mock.calls[0][0]).toContain(
    mockContentTypes[2].sys.environment.sys.id
  )

  expect(log.mock.calls[1][0]).toContain(mockContentTypes[2].name)
  expect(log.mock.calls[1][0]).toContain(mockContentTypes[2].sys.id)
})

const {
  environmentCreate
} = require('../../../../../lib/cmds/space_cmds/environment_cmds/create')
const { getContext } = require('../../../../../lib/context')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients')

jest.mock('../../../../../lib/context')
jest.mock('../../../../../lib/utils/contentful-clients')

const environmentData = {
  name: 'environment name',
  sys: {
    id: 'environmentId'
  }
}

const defaults = {
  context: {
    managementToken: 'management-token',
    activeSpaceId: 'someSpaceID'
  },
  environmentId: 'test'
}

const createEnvironmentWithIdStub = jest.fn().mockResolvedValue(environmentData)

const fakeClient = {
  getSpace: async () => ({
    createEnvironmentWithId: createEnvironmentWithIdStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

getContext.mockResolvedValue({
  managementToken: 'mockedToken'
})

afterEach(() => {
  createEnvironmentWithIdStub.mockClear()
  createManagementClient.mockClear()
})

test('create new environment with id', async () => {
  const result = await environmentCreate(defaults)
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub.mock.calls[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.mock.calls[0][1]).toEqual({})
})

test('create new environment with id and name', async () => {
  const result = await environmentCreate({
    ...defaults,
    name: 'test'
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub.mock.calls[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.mock.calls[0][1]).toEqual({
    name: 'test'
  })
  expect(createEnvironmentWithIdStub.mock.calls[0].length).toEqual(2) // should not send source param
})

test('create new environment with id and name and source', async () => {
  const result = await environmentCreate({
    ...defaults,
    name: 'test',
    source: 'srcEnv'
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub.mock.calls[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.mock.calls[0][1]).toEqual({
    name: 'test'
  })
  expect(createEnvironmentWithIdStub.mock.calls[0][2]).toEqual('srcEnv')
})

const {
  environmentUse
} = require('../../../../../lib/cmds/space_cmds/environment_cmds/use')

const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients')
const { setContext, getContext } = require('../../../../../lib/context')

jest.mock('../../../../../lib/utils/contentful-clients')
jest.mock('../../../../../lib/context')

const getEnvironment = jest.fn().mockResolvedValue({
  sys: {
    id: 'test'
  },
  name: 'test'
})

createManagementClient.mockReturnValue({
  getSpace: jest.fn().mockResolvedValue({
    sys: {
      id: 'mocked'
    },
    name: 'mocked',
    getEnvironment
  })
})

afterEach(() => {
  getContext.mockClear()
  setContext.mockClear()
})

test('it writes the environment id to contentfulrc.json', async () => {
  getContext.mockResolvedValue({
    managementToken: 'managementToken',
    activeSpaceId: 'spaceId'
  })
  const stubArgv = {
    context: {
      managementToken: 'managementToken',
      activeSpaceId: 'spaceId'
    },
    environmentId: 'test'
  }
  await environmentUse(stubArgv)
  expect(setContext.mock.calls[0][0]).toEqual({ activeEnvironmentId: 'test' })
})

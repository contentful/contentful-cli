const { spaceUse } = require('../../../../lib/cmds/space_cmds/use.js')

const { setContext } = require('../../../../lib/context.js')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients.js')

jest.mock('../../../../lib/context.js')
jest.mock('../../../../lib/utils/contentful-clients.js')

const getSpaceStub = jest.fn().mockResolvedValue({
  sys: {
    id: 'test'
  },
  name: 'mocked'
})
const fakeClient = {
  getSpace: getSpaceStub
}
createManagementClient.mockResolvedValue(fakeClient)

test('it writes the enviroment id to contentfulrc.json', async () => {
  const stubArgv = {
    context: {
      managementToken: 'managementToken',
      activeEnvironmentId: 'master'
    },
    spaceId: 'test'
  }
  await spaceUse(stubArgv)
  expect(setContext).toHaveBeenCalledWith({
    activeEnvironmentId: 'master',
    activeSpaceId: 'test'
  })
})

const { spaceUse } = require('../../../../lib/cmds/space_cmds/use.mjs')

const { setContext } = require('../../../../lib/context.mjs')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients.mjs')

jest.mock('../../../../lib/context.mjs')
jest.mock('../../../../lib/utils/contentful-clients.mjs')

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

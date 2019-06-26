import { spaceUse } from '../../../../lib/cmds/space_cmds/use'

import { setContext } from '../../../../lib/context'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')

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
    'activeEnvironmentId': 'master',
    'activeSpaceId': 'test'
  })
})

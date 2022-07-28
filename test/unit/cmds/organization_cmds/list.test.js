const {
  organizationList
} = require('../../../../lib/cmds/organization_cmds/list.js')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients.js')
const { log } = require('../../../../lib/utils/log.js')

jest.mock('../../../../lib/context.js')
jest.mock('../../../../lib/utils/contentful-clients.js')
jest.mock('../../../../lib/utils/log.js')

const organizationData = {
  items: [
    {
      sys: {
        type: 'Organization',
        id: '0D9ZC8rLWiw6x5qizZGiRs',
        version: '1',
        createdAt: '2015-05-18T11:29:46.809Z',
        updatedAt: '2015-05-18T11:29:46.809Z'
      },
      name: 'My organization'
    },
    {
      sys: {
        type: 'Organization 2',
        id: 'ewr1k12341lk4123332131',
        version: '1',
        createdAt: '2015-05-18T11:29:46.809Z',
        updatedAt: '2015-05-18T11:29:46.809Z'
      },
      name: 'My second organization'
    }
  ]
}

const fakeClient = {
  getOrganizations: async () => organizationData
}
createManagementClient.mockResolvedValue(fakeClient)

afterEach(() => {
  createManagementClient.mockClear()
  log.mockClear()
})

test('list organizations', async () => {
  await organizationList({
    context: {
      managementToken: 'managementToken'
    }
  })

  expect(createManagementClient).toHaveBeenCalledTimes(1)
  const [result] = log.mock.calls[0]
  const [org1, org2] = organizationData.items
  expect(result).toContain(org1.name)
  expect(result).toContain(org1.sys.id)
  expect(result).toContain(org2.name)
  expect(result).toContain(org2.sys.id)
})

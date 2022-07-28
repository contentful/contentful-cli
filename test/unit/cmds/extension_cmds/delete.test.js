const {
  deleteExtension
} = require('../../../../lib/cmds/extension_cmds/delete.js')

const { successEmoji } = require('../../../../lib/utils/emojis.js')
const { success } = require('../../../../lib/utils/log.js')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients.js')

jest.mock('../../../../lib/context.js')
jest.mock('../../../../lib/utils/log.js')
jest.mock('../../../../lib/utils/contentful-clients.js')

const deleteStub = jest.fn()

const fakeClient = {
  getSpace: async () => ({
    getEnvironment: async () => ({
      getUiExtension: async () => ({
        delete: deleteStub,
        sys: { id: '123', version: 3 }
      })
    })
  })
}
createManagementClient.mockResolvedValue(fakeClient)

beforeEach(() => {
  success.mockClear()
  createManagementClient.mockClear()
})

test('Throws error if --version and --force are missing', async () => {
  await expect(
    deleteExtension({
      context: {
        managementToken: 'managementToken',
        activeSpaceId: 'space'
      },
      id: 'test'
    })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if wrong --version value is passed', async () => {
  await expect(
    deleteExtension({
      context: {
        managementToken: 'managementToken',
        activeSpaceId: 'space'
      },
      id: 'test',
      version: 4
    })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Logs message if delete is successful', async () => {
  await deleteExtension({
    context: { managementToken: 'managementToken', activeSpaceId: 'space' },
    id: 'test',
    force: true
  })
  expect(deleteStub).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenLastCalledWith(
    `${successEmoji} Successfully deleted extension with ID test`
  )
})

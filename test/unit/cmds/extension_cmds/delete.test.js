const {
  deleteExtension
} = require('../../../../lib/cmds/extension_cmds/delete.mjs')

const { successEmoji } = require('../../../../lib/utils/emojis.mjs')
const { success } = require('../../../../lib/utils/log.mjs')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients.mjs')

jest.mock('../../../../lib/context.mjs')
jest.mock('../../../../lib/utils/log.mjs')
jest.mock('../../../../lib/utils/contentful-clients.mjs')

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

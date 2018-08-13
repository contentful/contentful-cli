import { deleteExtension } from '../../../../lib/cmds/extension_cmds/delete'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'
import { successEmoji } from '../../../../lib/utils/emojis'
import { success } from '../../../../lib/utils/log'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'

jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')

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

beforeAll(() => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken',
    activeSpaceId: 'someSpaceId'
  })
})

beforeEach(() => {
  success.mockClear()
  createManagementClient.mockClear()
})

test('Throws error if --version and --force are missing', async () => {
  await expect(deleteExtension({ spaceId: 'space', id: 'test' })).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if wrong --version value is passed', async () => {
  await expect(deleteExtension({ spaceId: 'space', id: 'test', version: 4 })).rejects.toThrowErrorMatchingSnapshot()
})

test('Logs message if delete is successful', async () => {
  await deleteExtension({spaceId: 'space', id: 'test', force: true})
  expect(deleteStub).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenLastCalledWith(`${successEmoji} Successfully deleted extension with ID test`)
})

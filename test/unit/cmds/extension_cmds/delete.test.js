import { stub } from 'sinon'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'
import { successEmoji } from '../../../../lib/utils/emojis'

import {
  deleteExtension,
  __RewireAPI__ as deleteRewireAPI
} from '../../../../lib/cmds/extension_cmds/delete'

import { ValidationError } from '../../../../lib/utils/error'

const successStub = stub()

const mockExtension = {
  delete: stub(),
  sys: { id: '123', version: 3 }
}
const environmentStub = stub().resolves({
  getUiExtension: stub().resolves(mockExtension)
})
beforeAll(() => {
  const fakeClient = {
    getSpace: stub().resolves({
      getEnvironment: environmentStub
    })
  }
  const createManagementClientStub = stub().returns(fakeClient)

  emptyContext()
  setContext({
    cmaToken: 'mockedToken',
    activeSpaceId: 'someSpaceId'
  })

  deleteRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  deleteRewireAPI.__Rewire__('success', successStub)
})

afterAll(() => {
  deleteRewireAPI.__ResetDependency__('createManagementClient')
  deleteRewireAPI.__ResetDependency__('success')
})

test('Throws error if --version and --force are missing', async () => {
  const cmd = deleteExtension({spaceId: 'space', id: 'test'})
  const error = await expect(cmd).toThrowError(ValidationError)

  expect(
    error.message.includes('Please provide current version or use the --force flag')
  ).toBeTruthy()
})

test('Throws error if wrong --version value is passed', async () => {
  const cmd = deleteExtension({spaceId: 'space', id: 'test', version: 4})
  const error = await expect(cmd).toThrowError(ValidationError)
  expect(
    error.message.includes('Version provided does not match current resource version')
  ).toBeTruthy()
})

test('Logs message if delete is successful', async () => {
  await deleteExtension({spaceId: 'space', id: 'test', force: true})
  expect(mockExtension.delete.calledOnce).toBe(true)
  expect(
    successStub.calledWith(`${successEmoji} Successfully deleted extension with ID test`)
  ).toBe(true)
})

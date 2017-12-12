import test from 'ava'
import { stub } from 'sinon'

import { successEmoji } from '../../../../lib/utils/emojis'

import {
  deleteExtension,
  __RewireAPI__ as deleteRewireAPI
} from '../../../../lib/cmds/extension_cmds/Delete'

import { ValidationError } from '../../../../lib/utils/error'

const successStub = stub()

const mockExtension = {
  delete: stub(),
  sys: { id: '123', version: 3 }
}

test.before(() => {
  const fakeClient = {
    getSpace: stub().returns({
      getUiExtension: stub().resolves(mockExtension)
    })
  }
  const createManagementClientStub = stub().returns(fakeClient)

  deleteRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  deleteRewireAPI.__Rewire__('success', successStub)
})

test.after.always(() => {
  deleteRewireAPI.__ResetDependency__('createManagementClient')
  deleteRewireAPI.__ResetDependency__('success')
})

test('Throws error if --version and --force are missing', async (t) => {
  const cmd = deleteExtension({spaceId: 'space', id: 'test'})
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Please provide current version or use the --force flag'))
})

test('Throws error if wrong --version value is passed', async (t) => {
  const cmd = deleteExtension({spaceId: 'space', id: 'test', version: 4})
  const error = await t.throws(cmd, ValidationError)
  t.truthy(error.message.includes('Version provided does not match current resource version'))
})

test('Logs message if delete is successful', async (t) => {
  await deleteExtension({spaceId: 'space', id: 'test', force: true})
  t.true(mockExtension.delete.calledOnce)
  t.true(successStub.calledWith(`${successEmoji} Successfully deleted extension with ID test`))
})

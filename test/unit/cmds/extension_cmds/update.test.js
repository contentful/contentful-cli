import test from 'ava'
import { stub } from 'sinon'

import { successEmoji } from '../../../../lib/utils/emojis'

import {
  updateExtension,
  __RewireAPI__ as rewireAPI
} from '../../../../lib/cmds/extension_cmds/update'

import { ValidationError } from '../../../../lib/utils/error'

const updateStub = stub()
const logStub = stub()
const successStub = stub()

const extension = {
  sys: { id: '123', version: 3 },
  extension: {
    name: 'Widget',
    fieldTypes: [ { type: 'Symbol' } ],
    src: 'https://awesome.extension'
  },
  update: updateStub
}

test.before(() => {
  const fakeClient = {
    getSpace: stub().returns({
      getUiExtension: stub().resolves(extension)
    })
  }
  const createManagementClientStub = stub().returns(fakeClient)

  rewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  rewireAPI.__Rewire__('logExtension', logStub)
  rewireAPI.__Rewire__('success', successStub)
})

test.after.always(() => {
  rewireAPI.__ResetDependency__('createManagementClient')
  rewireAPI.__ResetDependency__('logExtension')
  rewireAPI.__ResetDependency__('success')
})

test('Throws error if id is missing', async (t) => {
  const cmd = updateExtension({ spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension', force: true })
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Missing required properties: id'))
})

test('Throws error if name is missing', async (t) => {
  const cmd = updateExtension({ id: '123', spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension', force: true })
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Missing required properties: name'))
})

test('Throws error if field-types is missing', async (t) => {
  const cmd = updateExtension({ id: '123', spaceId: 'space', name: 'Widget', src: 'https://awesome.extension', force: true })
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Missing required properties: field-types'))
})

test('Throws error if --version and --force are missing', async (t) => {
  const cmd = updateExtension({ spaceId: 'space', id: '123', name: 'Widget', fieldTypes: ['Symbol'], src: 'https://awesome.extension' })
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Please provide current version or use the --force flag'))
})

test('Throws error if wrong --version value is passed', async (t) => {
  const cmd = updateExtension({ id: '123', spaceId: 'space', fieldTypes: ['Symbol'], name: 'New name', src: 'https://new.url', version: 4 })
  const error = await t.throws(cmd, ValidationError)
  t.truthy(error.message.includes('Version provided does not match current resource version'))
})

test('Calls update on extension', async (t) => {
  await updateExtension({ id: '123', spaceId: 'space', fieldTypes: ['Symbol'], name: 'New name', src: 'https://new.url', force: true })

  t.true(updateStub.calledOnce)
  t.true(logStub.calledOnce)
  t.true(successStub.calledWith(`${successEmoji} Successfully updated extension:\n`))
})

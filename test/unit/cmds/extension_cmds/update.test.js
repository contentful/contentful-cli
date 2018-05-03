import test from 'ava'
import { stub } from 'sinon'
import { resolve } from 'path'

import { successEmoji } from '../../../../lib/utils/emojis'

import {
  updateExtension,
  __RewireAPI__ as rewireAPI
} from '../../../../lib/cmds/extension_cmds/update'

import {
  __RewireAPI__ as prepareDataRewireAPI
} from '../../../../lib/cmds/extension_cmds/utils/prepare-data'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'

import { ValidationError } from '../../../../lib/utils/error'

const basicExtension = {
  sys: { id: '123', version: 3 },
  extension: {
    name: 'Widget',
    fieldTypes: [ { type: 'Symbol' } ],
    src: 'https://awesome.extension'
  }
}

const updateStub = stub().returns(basicExtension)
const successStub = stub()

const extension = Object.assign({}, basicExtension, {
  update: updateStub
})

test.before(() => {
  const fakeClient = {
    getSpace: stub().returns({
      getEnvironment: stub().resolves({
        getUiExtension: stub().resolves(extension)
      })
    })
  }
  const createManagementClientStub = stub().returns(fakeClient)

  emptyContext()
  setContext({
    cmaToken: 'mockedToken',
    activeSpaceId: 'someSpaceId'
  })

  rewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  rewireAPI.__Rewire__('success', successStub)
})

test.afterEach(() => {
  updateStub.resetHistory()
})

test.after.always(() => {
  rewireAPI.__ResetDependency__('createManagementClient')
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

test.serial('Calls update on extension with no version number but force', async (t) => {
  await updateExtension({
    id: '123',
    force: true,
    spaceId: 'space',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    src: 'https://new.url'
  })

  t.true(updateStub.calledOnce)
  t.true(successStub.calledWith(`${successEmoji} Successfully updated extension:\n`))
})

test.serial('Calls update on extension and reads srcdoc from disk', async (t) => {
  await updateExtension({
    id: '123',
    version: 3,
    spaceId: 'space',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    srcdoc: resolve(__dirname, 'sample-extension.html')
  })

  t.true(updateStub.calledOnce)
  t.true(successStub.calledWith(`${successEmoji} Successfully updated extension:\n`))
})

test.serial('Updates an extension with parameter definitions ', async (t) => {
  const descriptor = `{
    "name": "Test Extension",
    "fieldTypes": ["Boolean"],
    "src": "https://new.extension",
    "parameters": {
      "instance": [{"id": "test", "type": "Symbol", "name": "Stringie"}],
      "installation": [{"id": "flag", "type": "Boolean", "name": "Flaggie"}]
    }
  }`

  prepareDataRewireAPI.__Rewire__('readFileP', stub().returns(
    Promise.resolve(descriptor)
  ))

  await updateExtension({
    id: 'extension-id',
    descriptor: 'x.json',
    installationParameters: JSON.stringify({flag: true}),
    force: true
  })

  t.deepEqual(extension.extension, {
    name: 'Test Extension',
    src: 'https://new.extension',
    fieldTypes: [{type: 'Boolean'}],
    parameters: {
      instance: [{id: 'test', type: 'Symbol', name: 'Stringie'}],
      installation: [{id: 'flag', type: 'Boolean', name: 'Flaggie'}]
    }
  })
  t.deepEqual(extension.parameters, {flag: true})

  t.true(updateStub.calledOnce)
  t.true(successStub.calledWith(`${successEmoji} Successfully updated extension:\n`))
})

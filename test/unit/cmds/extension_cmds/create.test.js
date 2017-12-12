import test from 'ava'
import { stub } from 'sinon'

import { successEmoji } from '../../../../lib/utils/emojis'

import {
  createExtension,
  __RewireAPI__ as createRewireAPI
} from '../../../../lib/cmds/extension_cmds/create'

import {
  __RewireAPI__ as logRewireAPI
} from '../../../../lib/cmds/extension_cmds/utils/log-as-table'

import {
  __RewireAPI__ as prepareDataRewireAPI
} from '../../../../lib/cmds/extension_cmds/utils/prepare-data'

import { ValidationError } from '../../../../lib/utils/error'

const logStub = stub()
const successStub = stub()

const createUiExtensionStub = stub().resolves({
  extension: {
    name: 'Widget',
    fieldTypes: [ { type: 'Symbol' } ],
    src: 'https://awesome.extension'
  },
  sys: { id: '123', version: 3 }
})

test.before(() => {
  const fakeClient = {
    getSpace: stub().returns({
      createUiExtension: createUiExtensionStub
    })
  }
  const createManagementClientStub = stub().returns(fakeClient)

  createRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  createRewireAPI.__Rewire__('success', successStub)
  logRewireAPI.__Rewire__('log', logStub)
})

test.after.always(() => {
  createRewireAPI.__ResetDependency__('createManagementClient')
  createRewireAPI.__ResetDependency__('success')
  logRewireAPI.__ResetDependency__('log')
})

test('Throws error if name is missing', async (t) => {
  const cmd = createExtension({ spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension' })
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Missing required properties: name'))
})

test('Throws error if field-types is missing', async (t) => {
  const cmd = createExtension({ spaceId: 'space', name: 'Widget', src: 'https://awesome.extension' })
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Missing required properties: field-types'))
})

test('Throws error if both src and srcdoc are not provided', async (t) => {
  const cmd = createExtension({ spaceId: 'space', name: 'Widget', fieldTypes: ['Symbol'] })
  const error = await t.throws(cmd, ValidationError)

  t.truthy(error.message.includes('Must contain exactly one of: src, srcdoc'))
})

test('Creates extension from command line arguments', async (t) => {
  await createExtension({
    spaceId: 'space',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    src: 'https://awesome.extension'
  })

  t.true(createUiExtensionStub.calledWith({
    extension: {
      name: 'Widget',
      src: 'https://awesome.extension',
      fieldTypes: [{type: 'Symbol'}]
    }
  }))

  t.true(successStub.calledWith(`${successEmoji} Successfully created extension:\n`))
})

test('Logs extension data', async (t) => {
  await createExtension({
    spaceId: 'space',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    src: 'https://awesome.extension'
  })

  const values = [ '123', 'Widget', 'Symbol', 'https://awesome.extension' ]

  values.forEach(value => {
    t.true(logStub.lastCall.args[0].includes(value))
  })

  t.true(successStub.calledWith(`${successEmoji} Successfully created extension:\n`))
})

test('Creates extension with values from descriptor file', async (t) => {
  const descriptor = `{
    "name": "Test Extension",
    "fieldTypes": ["Boolean"],
    "src": "https://new.extension"
  }`

  prepareDataRewireAPI.__Rewire__('readFileP', stub().returns(
    Promise.resolve(descriptor)
  ))

  await createExtension({ descriptor: 'test.json' })

  t.true(createUiExtensionStub.calledWith({
    extension: {
      name: 'Test Extension',
      src: 'https://new.extension',
      fieldTypes: [{type: 'Boolean'}]
    }
  }))

  t.true(successStub.calledWith(`${successEmoji} Successfully created extension:\n`))
})

import { stub } from 'sinon'
import { resolve } from 'path'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'
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
const getEnvironmentStub = stub().resolves({
  createUiExtension: createUiExtensionStub
})
beforeAll(() => {
  const fakeClient = {
    getSpace: stub().resolves({
      getEnvironment: getEnvironmentStub
    })
  }
  const createManagementClientStub = stub().returns(fakeClient)

  emptyContext()
  setContext({
    cmaToken: 'mockedToken',
    activeSpaceId: 'someSpaceId'
  })

  createRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  createRewireAPI.__Rewire__('success', successStub)
  logRewireAPI.__Rewire__('log', logStub)
})

afterAll(() => {
  createRewireAPI.__ResetDependency__('createManagementClient')
  createRewireAPI.__ResetDependency__('success')
  logRewireAPI.__ResetDependency__('log')
})

test('Throws error if name is missing', async () => {
  const cmd = createExtension({ spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension' })
  const error = await expect(cmd).toThrowError(ValidationError)

  expect(error.message.includes('Missing required properties: name')).toBeTruthy()
})

test('Throws error if field-types is missing', async () => {
  const cmd = createExtension({ spaceId: 'space', environmentId: 'master', name: 'Widget', src: 'https://awesome.extension' })
  const error = await expect(cmd).toThrowError(ValidationError)

  expect(error.message.includes('Missing required properties: field-types')).toBeTruthy()
})

test('Throws error if both src and srcdoc are not provided', async () => {
  const cmd = createExtension({ spaceId: 'space', environmentId: 'master', name: 'Widget', fieldTypes: ['Symbol'] })
  const error = await expect(cmd).toThrowError(ValidationError)

  expect(error.message.includes('Must contain exactly one of: src, srcdoc')).toBeTruthy()
})

test('Throws error if both src and srcdoc are at the same time', async () => {
  const cmd = createExtension({ spaceId: 'space', name: 'Widget', environmentId: 'master', fieldTypes: ['Symbol'], src: 'https://awesome.extension', srcdoc: './awesome-extension.html' })
  const error = await expect(cmd).toThrowError(ValidationError)

  expect(error.message.includes('Must contain exactly one of: src, srcdoc')).toBeTruthy()
})

test('Throws an error if installation parameters cannot be parsed', async () => {
  const cmd = createExtension({ spaceId: 'space', name: 'Widget', fieldTypes: ['Symbol'], src: 'https://awesome.extension', installationParameters: '{"test": lol}' })
  const error = await expect(cmd).toThrowError(ValidationError)

  expect(
    error.message.includes('Could not parse JSON string of installation parameter values')
  ).toBeTruthy()
})

test('Creates extension from command line arguments', async () => {
  await createExtension({
    spaceId: 'space',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    src: 'https://awesome.extension'
  })

  expect(createUiExtensionStub.calledWith({
    extension: {
      name: 'Widget',
      src: 'https://awesome.extension',
      fieldTypes: [{type: 'Symbol'}]
    }
  })).toBe(true)

  expect(
    successStub.calledWith(`${successEmoji} Successfully created extension:\n`)
  ).toBe(true)
})

test('Logs extension data', async () => {
  await createExtension({
    spaceId: 'space',
    environmentId: 'master',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    src: 'https://awesome.extension'
  })

  const values = [ '123', 'Widget', 'Symbol', 'https://awesome.extension' ]

  values.forEach(value => {
    expect(logStub.lastCall.args[0].includes(value)).toBe(true)
  })

  expect(
    successStub.calledWith(`${successEmoji} Successfully created extension:\n`)
  ).toBe(true)
})

test('Creates extension with values from descriptor file', async () => {
  const descriptor = `{
    "name": "Test Extension",
    "fieldTypes": ["Boolean"],
    "src": "https://new.extension"
  }`

  prepareDataRewireAPI.__Rewire__('readFileP', stub().returns(
    Promise.resolve(descriptor)
  ))

  await createExtension({ descriptor: 'test.json' })

  expect(createUiExtensionStub.calledWith({
    extension: {
      name: 'Test Extension',
      src: 'https://new.extension',
      fieldTypes: [{type: 'Boolean'}]
    }
  })).toBe(true)

  expect(
    successStub.calledWith(`${successEmoji} Successfully created extension:\n`)
  ).toBe(true)
})

test(
  'Creates an extension with parameter definitions and values',
  async () => {
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

    await createExtension({ descriptor: 'x.json', installationParameters: JSON.stringify({flag: true}) })

    expect(createUiExtensionStub.calledWith({
      extension: {
        name: 'Test Extension',
        src: 'https://new.extension',
        fieldTypes: [{type: 'Boolean'}],
        parameters: {
          instance: [{id: 'test', type: 'Symbol', name: 'Stringie'}],
          installation: [{id: 'flag', type: 'Boolean', name: 'Flaggie'}]
        }
      },
      parameters: {flag: true}
    })).toBe(true)

    expect(
      successStub.calledWith(`${successEmoji} Successfully created extension:\n`)
    ).toBe(true)
  }
)

test(
  'Creates extension, descriptor src is overwritten by args srcdoc',
  async () => {
    const descriptor = `{
      "name": "Test Extension",
      "fieldTypes": ["Boolean"],
      "src": "https://new.extension"
    }`

    prepareDataRewireAPI.__Rewire__('readFileP', stub().returns(
      Promise.resolve(descriptor)
    ))

    await createExtension({ descriptor: 'test.json', srcdoc: resolve(__dirname, 'sample-extension.html') })

    expect(createUiExtensionStub.calledWith({
      extension: {
        name: 'Test Extension',
        srcdoc: '<h1>Sample Extension Content</h1>\n',
        fieldTypes: [{type: 'Boolean'}]
      }
    })).toBe(true)

    expect(
      successStub.calledWith(`${successEmoji} Successfully created extension:\n`)
    ).toBe(true)
  }
)

test('Creates extension and reads srcdoc from disk', async () => {
  await createExtension({
    spaceId: 'space',
    environmentId: 'master',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    srcdoc: resolve(__dirname, 'sample-extension.html')
  })

  expect(createUiExtensionStub.calledWith({
    extension: {
      name: 'Widget',
      srcdoc: '<h1>Sample Extension Content</h1>\n',
      fieldTypes: [{type: 'Symbol'}]
    }
  })).toBe(true)

  expect(
    successStub.calledWith(`${successEmoji} Successfully created extension:\n`)
  ).toBe(true)
})

import { resolve } from 'path'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'
import { successEmoji } from '../../../../lib/utils/emojis'
import { success, log } from '../../../../lib/utils/log'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'
import { createExtension } from '../../../../lib/cmds/extension_cmds/create'
import { readFileP } from '../../../../lib/utils/fs'
import { ValidationError } from '../../../../lib/utils/error'
import readSrcDocFile from '../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file'

jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/fs')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file')

readSrcDocFile.mockImplementation(async (extension) => { extension.srcdoc = '<h1>Sample Extension Content</h1>' })

const createUiExtensionStub = jest.fn().mockResolvedValue({
  extension: {
    name: 'Widget',
    fieldTypes: [ { type: 'Symbol' } ],
    src: 'https://awesome.extension'
  },
  sys: { id: '123', version: 3 }
})

const fakeClient = {
  getSpace: async () => ({
    getEnvironment: async () => ({
      createUiExtension: createUiExtensionStub
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
  log.mockClear()
  createManagementClient.mockClear()
  readFileP.mockClear()
})

test('Throws error if name is missing', async () => {
  await expect(createExtension({ spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension' })).rejects.toThrowError(ValidationError)
})

test('Throws error if field-types is missing', async () => {
  try {
    await expect(createExtension({ spaceId: 'space', environmentId: 'master', name: 'Widget', src: 'https://awesome.extension' })).rejects.toThrowError(ValidationError)
  } catch (error) {
    expect(error.message.includes('Missing required properties: field-types')).toBeTruthy()
  }
})

test('Throws error if both src and srcdoc are not provided', async () => {
  try {
    expect(createExtension({ spaceId: 'space', environmentId: 'master', name: 'Widget', fieldTypes: ['Symbol'] })).rejects.toThrowError(ValidationError)
  } catch (error) {
    expect(error.message.includes('Must contain exactly one of: src, srcdoc')).toBeTruthy()
  }
})

test('Throws error if both src and srcdoc are at the same time', async () => {
  try {
    await expect(createExtension({ spaceId: 'space', name: 'Widget', environmentId: 'master', fieldTypes: ['Symbol'], src: 'https://awesome.extension', srcdoc: './awesome-extension.html' })).rejects.toThrowError(ValidationError)
  } catch (error) {
    expect(error.message.includes('Must contain exactly one of: src, srcdoc')).toBeTruthy()
  }
})

test('Throws an error if installation parameters cannot be parsed', async () => {
  try {
    await expect(createExtension({ spaceId: 'space', name: 'Widget', fieldTypes: ['Symbol'], src: 'https://awesome.extension', installationParameters: '{"test": lol}' })).rejects.toThrowError(ValidationError)
  } catch (error) {
    expect(
      error.message.includes('Could not parse JSON string of installation parameter values')
    ).toBeTruthy()
  }
})

test('Creates extension from command line arguments', async () => {
  await createExtension({
    spaceId: 'space',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    src: 'https://awesome.extension'
  })

  expect(createUiExtensionStub).toHaveBeenCalledWith({
    extension: {
      name: 'Widget',
      src: 'https://awesome.extension',
      fieldTypes: [{type: 'Symbol'}]
    }
  })
  expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully created extension:\n`)
  expect(log).toHaveBeenCalledTimes(1)
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
    expect(log.mock.calls[0][0]).toContain(value)
  })

  expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully created extension:\n`)
})

test('Creates extension with values from descriptor file', async () => {
  const descriptor = `{
    "name": "Test Extension",
    "fieldTypes": ["Boolean"],
    "src": "https://new.extension"
  }`

  readFileP.mockResolvedValue(descriptor)

  await createExtension({ descriptor: 'test.json' })

  expect(createUiExtensionStub).toHaveBeenCalledWith({
    extension: {
      name: 'Test Extension',
      src: 'https://new.extension',
      fieldTypes: [{type: 'Boolean'}]
    }
  })

  expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully created extension:\n`)
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

    readFileP.mockResolvedValue(descriptor)

    await createExtension({ descriptor: 'x.json', installationParameters: JSON.stringify({flag: true}) })

    expect(createUiExtensionStub).toHaveBeenCalledWith({
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
    })

    expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully created extension:\n`)
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

    readFileP.mockResolvedValue(descriptor)

    await createExtension({ descriptor: 'test.json', srcdoc: resolve(__dirname, 'sample-extension.html') })

    expect(createUiExtensionStub).toHaveBeenCalledWith({
      extension: {
        name: 'Test Extension',
        srcdoc: '<h1>Sample Extension Content</h1>',
        fieldTypes: [{type: 'Boolean'}]
      }
    })

    expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully created extension:\n`)
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

  expect(createUiExtensionStub).toHaveBeenCalledWith({
    extension: {
      name: 'Widget',
      srcdoc: '<h1>Sample Extension Content</h1>',
      fieldTypes: [{type: 'Symbol'}]
    }
  })

  expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully created extension:\n`)
})

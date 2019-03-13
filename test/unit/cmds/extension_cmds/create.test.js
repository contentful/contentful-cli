import { resolve } from 'path'

import { createExtensionHandler } from '../../../../lib/cmds/extension_cmds/create'

import { getContext } from '../../../../lib/context'
import { successEmoji } from '../../../../lib/utils/emojis'
import { success, log } from '../../../../lib/utils/log'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'
import { readFileP } from '../../../../lib/utils/fs'
import readSrcDocFile from '../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file'

jest.mock('../../../../lib/context')
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

getContext.mockResolvedValue({
  cmaToken: 'mockedToken',
  activeSpaceId: 'someSpaceId'
})

beforeEach(() => {
  success.mockClear()
  log.mockClear()
  createManagementClient.mockClear()
  readFileP.mockClear()
})

test('Throws error if name is missing', async () => {
  await expect(
    createExtensionHandler({ spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension' })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if both src and srcdoc are not provided', async () => {
  await expect(
    createExtensionHandler({ spaceId: 'space', environmentId: 'master', name: 'Widget', fieldTypes: ['Symbol'] })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if both src and srcdoc are at the same time', async () => {
  await expect(
    createExtensionHandler({
      spaceId: 'space',
      name: 'Widget',
      environmentId: 'master',
      fieldTypes: ['Symbol'],
      src: 'https://awesome.extension',
      srcdoc: './awesome-extension.html'
    })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws an error if installation parameters cannot be parsed', async () => {
  await expect(
    createExtensionHandler({
      spaceId: 'space',
      name: 'Widget',
      fieldTypes: ['Symbol'],
      src: 'https://awesome.extension',
      installationParameters: '{"test": lol}'
    })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates extension if field-types is missing', async () => {
  await createExtensionHandler({
    spaceId: 'space',
    name: 'Widget',
    src: 'https://awesome.extension'
  })

  expect(createUiExtensionStub).toHaveBeenCalledWith({
    extension: {
      name: 'Widget',
      src: 'https://awesome.extension'
    }
  })
  expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully created extension:\n`)
  expect(log).toHaveBeenCalledTimes(3)
})

test('Creates extension from command line arguments', async () => {
  await createExtensionHandler({
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
  expect(log).toHaveBeenCalledTimes(3)
})

test('Logs extension data', async () => {
  await createExtensionHandler({
    spaceId: 'space',
    environmentId: 'master',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    src: 'https://awesome.extension'
  })

  const values = [ '123', 'Widget', 'Symbol', 'https://awesome.extension' ]

  expect(log.mock.calls[0][0]).toContain('Space: space')
  expect(log.mock.calls[1][0]).toContain('Your extension: https://app.contentful.com/spaces/space/settings/extensions/123')
  values.forEach(value => {
    expect(log.mock.calls[2][0]).toContain(value)
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

  await createExtensionHandler({ descriptor: 'test.json' })

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

    await createExtensionHandler({ descriptor: 'x.json', installationParameters: JSON.stringify({flag: true}) })

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

    await createExtensionHandler({ descriptor: 'test.json', srcdoc: resolve(__dirname, 'sample-extension.html') })

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
  await createExtensionHandler({
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

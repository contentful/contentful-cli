import { resolve } from 'path'

import { updateExtensionHandler } from '../../../../lib/cmds/extension_cmds/update'

import { getContext } from '../../../../lib/context'

import { successEmoji } from '../../../../lib/utils/emojis'
import { success, log } from '../../../../lib/utils/log'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'
import { readFileP } from '../../../../lib/utils/fs'
import readSrcDocFile from '../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file'
import { createExtension } from '../../../../lib/cmds/extension_cmds/create'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/fs')
jest.mock('../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file')
jest.mock('../../../../lib/cmds/extension_cmds/create', () => ({
  createExtension: jest.fn()
}), { virtual: true })

readSrcDocFile.mockImplementation(async (extension) => { extension.srcdoc = '<h1>Sample Extension Content</h1>' })

const basicExtension = {
  sys: { id: '123', version: 3 }
}

let updateStub
let fakeClient

getContext.mockResolvedValue({
  cmaToken: 'mockedToken',
  activeSpaceId: 'someSpaceId'
})

beforeEach(() => {
  updateStub = jest.fn().mockImplementation((extension) => extension)

  fakeClient = {
    getSpace: async () => ({
      getEnvironment: async () => ({
        getUiExtension: async () => {
          const extension = {...basicExtension}
          extension.update = function () {
            return updateStub(this)
          }
          return extension
        }
      })
    })
  }
  createManagementClient.mockResolvedValue(fakeClient)
})

afterEach(() => {
  createManagementClient.mockClear()
  updateStub.mockClear()
  success.mockClear()
  log.mockClear()
  createExtension.mockClear()
})

test('Throws error if id is missing', async () => {
  await expect(
    updateExtensionHandler({ spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension', force: true })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if name is missing', async () => {
  await expect(
    updateExtensionHandler({ id: '123', spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension', force: true })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if --version and --force are missing', async () => {
  await expect(
    updateExtensionHandler({ spaceId: 'space', id: '123', name: 'Widget', fieldTypes: ['Symbol'], src: 'https://awesome.extension' })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if wrong --version value is passed', async () => {
  await expect(
    updateExtensionHandler({ id: '123', spaceId: 'space', fieldTypes: ['Symbol'], name: 'New name', src: 'https://new.url', version: 4 })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates an extension with there is no one and force flag is present', async () => {
  fakeClient = {
    getSpace: async () => ({
      getEnvironment: async () => ({
        getUiExtension: () => {
          throw Error('extension does not exist')
        }
      })
    })
  }

  createManagementClient.mockClear()
  createManagementClient.mockResolvedValue(fakeClient)
  createExtension.mockResolvedValue({
    sys: { id: '123' },
    extension: {name: 'Widget', src: 'https://new.url'}
  })

  await updateExtensionHandler({
    id: '123',
    force: true,
    spaceId: 'space',
    name: 'Widget',
    src: 'https://new.url'
  })

  expect(createExtension).toHaveBeenCalledTimes(1)

  await expect(
    updateExtensionHandler({
      id: '123',
      spaceId: 'space',
      name: 'Widget',
      src: 'https://new.url'
    })
  ).rejects.toThrowErrorMatchingSnapshot()

  expect(createExtension).toHaveBeenCalledTimes(1)
})

test(
  'Calls update on extension with no version number but force',
  async () => {
    await updateExtensionHandler({
      id: '123',
      force: true,
      spaceId: 'space',
      name: 'Widget',
      src: 'https://new.url'
    })

    expect(updateStub).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully updated extension:\n`)
  }
)

test('Calls update on extension and reads srcdoc from disk', async () => {
  await updateExtensionHandler({
    id: '123',
    version: 3,
    spaceId: 'space',
    name: 'Widget',
    fieldTypes: ['Symbol'],
    srcdoc: resolve(__dirname, 'sample-extension.html')
  })

  expect(updateStub).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully updated extension:\n`)
})

test('Updates an extension with parameter definitions ', async () => {
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

  await updateExtensionHandler({
    id: 'extension-id',
    descriptor: 'x.json',
    installationParameters: JSON.stringify({flag: true}),
    force: true
  })

  expect(log.mock.calls[0][0]).toContain('https://new.extension')
  expect(log.mock.calls[0][0]).toContain('Boolean')
  expect(log.mock.calls[0][0]).toContain('Instance: 1')
  expect(log.mock.calls[0][0]).toContain('Installation: 1')

  expect(updateStub).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully updated extension:\n`)
})

import { resolve } from 'path'

import { updateExtension } from '../../../../lib/cmds/extension_cmds/update'

import { getContext } from '../../../../lib/context'

import { successEmoji } from '../../../../lib/utils/emojis'
import { success, log } from '../../../../lib/utils/log'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'
import { readFileP } from '../../../../lib/utils/fs'
import readSrcDocFile from '../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/fs')
jest.mock('../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file')

readSrcDocFile.mockImplementation(async (extension) => { extension.srcdoc = '<h1>Sample Extension Content</h1>' })

const basicExtension = {
  sys: { id: '123', version: 3 }
}

const updateStub = jest.fn().mockImplementation((extension) => extension)

const fakeClient = {
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

getContext.mockResolvedValue({
  cmaToken: 'mockedToken',
  activeSpaceId: 'someSpaceId'
})

afterEach(() => {
  updateStub.mockClear()
  success.mockClear()
  log.mockClear()
})

test('Throws error if id is missing', async () => {
  await expect(
    updateExtension({ spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension', force: true })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if name is missing', async () => {
  await expect(
    updateExtension({ id: '123', spaceId: 'space', fieldTypes: ['Symbol'], src: 'https://awesome.extension', force: true })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if field-types is missing', async () => {
  await expect(
    updateExtension({ id: '123', spaceId: 'space', name: 'Widget', src: 'https://awesome.extension', force: true })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if --version and --force are missing', async () => {
  await expect(
    updateExtension({ spaceId: 'space', id: '123', name: 'Widget', fieldTypes: ['Symbol'], src: 'https://awesome.extension' })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if wrong --version value is passed', async () => {
  await expect(
    updateExtension({ id: '123', spaceId: 'space', fieldTypes: ['Symbol'], name: 'New name', src: 'https://new.url', version: 4 })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test(
  'Calls update on extension with no version number but force',
  async () => {
    await updateExtension({
      id: '123',
      force: true,
      spaceId: 'space',
      name: 'Widget',
      fieldTypes: ['Symbol'],
      src: 'https://new.url'
    })

    expect(updateStub).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledWith(`${successEmoji} Successfully updated extension:\n`)
  }
)

test('Calls update on extension and reads srcdoc from disk', async () => {
  await updateExtension({
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

  await updateExtension({
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

const { resolve } = require('path')

const {
  updateExtensionHandler
} = require('../../../../lib/cmds/extension_cmds/update')

const { successEmoji } = require('../../../../lib/utils/emojis')
const { success, log } = require('../../../../lib/utils/log')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients')
const { readFileP } = require('../../../../lib/utils/fs')
const readSrcDocFile = require('../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file')
const {
  createExtension
} = require('../../../../lib/cmds/extension_cmds/create')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/fs')
jest.mock('../../../../lib/cmds/extension_cmds/utils/read-srcdoc-file')
jest.mock(
  '../../../../lib/cmds/extension_cmds/create',
  () => ({
    createExtension: jest.fn()
  }),
  { virtual: true }
)

readSrcDocFile.mockImplementation(async extension => {
  extension.srcdoc = '<h1>Sample Extension Content</h1>'
})

const basicExtension = {
  sys: { id: '123', version: 3 }
}

const defaults = {
  context: {
    managementToken: 'management-token',
    activeSpaceId: 'someSpaceId',
    activeEnvironmentId: 'someEnvironmentId'
  }
}

let updateStub
let fakeClient

beforeEach(() => {
  updateStub = jest.fn().mockImplementation(extension => extension)

  fakeClient = {
    getSpace: async () => ({
      getEnvironment: async () => ({
        getUiExtension: async () => {
          const extension = { ...basicExtension }
          extension.update = function() {
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
    updateExtensionHandler({
      ...defaults,
      fieldTypes: ['Symbol'],
      src: 'https://awesome.extension',
      force: true
    })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if name is missing', async () => {
  await expect(
    updateExtensionHandler({
      ...defaults,
      id: '123',
      fieldTypes: ['Symbol'],
      src: 'https://awesome.extension',
      force: true
    })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if --version and --force are missing', async () => {
  await expect(
    updateExtensionHandler({
      ...defaults,
      id: '123',
      name: 'Widget',
      fieldTypes: ['Symbol'],
      src: 'https://awesome.extension'
    })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Throws error if wrong --version value is passed', async () => {
  await expect(
    updateExtensionHandler({
      ...defaults,
      id: '123',
      fieldTypes: ['Symbol'],
      name: 'New name',
      src: 'https://new.url',
      version: 4
    })
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
    extension: { name: 'Widget', src: 'https://new.url' }
  })

  await updateExtensionHandler({
    ...defaults,
    id: '123',
    force: true,
    name: 'Widget',
    src: 'https://new.url'
  })

  expect(createExtension).toHaveBeenCalledTimes(1)

  await expect(
    updateExtensionHandler({
      ...defaults,
      id: '123',
      name: 'Widget',
      src: 'https://new.url'
    })
  ).rejects.toThrowErrorMatchingSnapshot()

  expect(createExtension).toHaveBeenCalledTimes(1)
})

test('Calls update on extension with no version number but force', async () => {
  await updateExtensionHandler({
    ...defaults,
    id: '123',
    force: true,
    name: 'Widget',
    src: 'https://new.url'
  })

  expect(updateStub).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenCalledWith(
    `${successEmoji} Successfully updated extension:\n`
  )
})

test('Calls update on extension and reads srcdoc from disk', async () => {
  await updateExtensionHandler({
    ...defaults,
    id: '123',
    version: 3,
    name: 'Widget',
    fieldTypes: ['Symbol'],
    srcdoc: resolve(__dirname, 'sample-extension.html')
  })

  expect(updateStub).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenCalledWith(
    `${successEmoji} Successfully updated extension:\n`
  )
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
    ...defaults,
    id: 'extension-id',
    descriptor: 'x.json',
    installationParameters: JSON.stringify({ flag: true }),
    force: true
  })

  expect(log.mock.calls[0][0]).toContain('Space: someSpaceId')
  expect(log.mock.calls[1][0]).toContain('Environment: someEnvironmentId')
  expect(log.mock.calls[2][0]).toContain(
    'Your extension: https://app.contentful.com/spaces/someSpaceId/environments/someEnvironmentId/settings/extensions/123'
  )
  expect(log.mock.calls[3][0]).toContain('https://new.extension')
  expect(log.mock.calls[3][0]).toContain('Boolean')
  expect(log.mock.calls[3][0]).toContain('Instance: 1')
  expect(log.mock.calls[3][0]).toContain('Installation: 1')

  expect(updateStub).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenCalledWith(
    `${successEmoji} Successfully updated extension:\n`
  )
})

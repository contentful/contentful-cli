import { builder, importSpace } from '../../../../lib/cmds/space_cmds/import'

import { version } from '../../../../package.json'
import { getContext } from '../../../../lib/context'
import contentfulImport from 'contentful-import'
import { createPlainClient } from '../../../../lib/utils/contentful-clients'
import { importEntriesWithBulkOperations } from '../../../../lib/utils/bulk-entry-import'
import { getPath, readFileP } from '../../../../lib/utils/fs'

jest.mock('../../../../lib/context')
jest.mock('contentful-import')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/fs')
jest.mock('../../../../lib/utils/bulk-entry-import', () => {
  const actual = jest.requireActual('../../../../lib/utils/bulk-entry-import')
  return {
    ...actual,
    importEntriesWithBulkOperations: jest.fn().mockResolvedValue({
      created: 1,
      updated: 0,
      published: 1,
      failures: []
    }),
    createCmaBulkTransport: jest.fn().mockReturnValue({ mocked: true })
  }
})

const mocks = {
  getContext: getContext as jest.MockedFunction<typeof getContext>,
  getPath: getPath as jest.MockedFunction<typeof getPath>,
  readFileP: readFileP as jest.MockedFunction<typeof readFileP>
}

mocks.getContext.mockResolvedValue({ managementToken: 'managementToken' })

beforeEach(() => {
  jest.clearAllMocks()
  mocks.getContext.mockResolvedValue({ managementToken: 'managementToken' })
  mocks.getPath.mockImplementation(path => path)
})

const stubArgv = {
  context: {
    activeSpaceId: 'spaceId',
    managementToken: 'managementToken'
  },
  skipContentModel: false,
  skipLocales: false,
  host: 'api.contentful.com',
  skipContentPublishing: false,
  skipContentUpdates: true,
  skipAssetUpdates: true,
  managementApplication: `contentful.cli/${version}`,
  managementFeature: 'space-import',
  uploadAssets: true,
  assetsDirectory: 'assets'
}

test('it registers the bulk entries option', () => {
  const yargs = {
    usage: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    config: jest.fn().mockReturnThis(),
    epilog: jest.fn().mockReturnThis()
  }

  builder(yargs as never)

  expect(yargs.option).toHaveBeenCalledWith(
    'use-bulk-entries',
    expect.objectContaining({ type: 'boolean', default: false })
  )
})

test('it should pass all args to contentful-import', async () => {
  await importSpace(stubArgv)
  const result = {
    ...stubArgv,
    managementToken: 'managementToken',
    spaceId: 'spaceId',
    environmentId: undefined,
    host: undefined,
    headers: {},
    skipContentUpdates: true,
    skipAssetUpdates: true,
    uploadAssets: true,
    assetsDirectory: 'assets'
  }
  expect(contentfulImport.mock.calls[0][0]).toEqual(result)
  expect(contentfulImport).toHaveBeenCalledTimes(1)
  expect(importEntriesWithBulkOperations).not.toHaveBeenCalled()
})

test('it should import entries via bulk operations when --use-bulk-entries is set', async () => {
  const entries = [{ sys: { id: 'e1', publishedVersion: 1 }, fields: {} }]
  ;(createPlainClient as jest.Mock).mockResolvedValue({ raw: {} })

  await importSpace({
    ...stubArgv,
    useBulkEntries: true,
    content: {
      contentTypes: [{ sys: { id: 'blogPost' } }],
      entries
    }
  })

  expect(contentfulImport).toHaveBeenCalledTimes(1)
  expect(contentfulImport.mock.calls[0][0].content).toEqual({
    contentTypes: [{ sys: { id: 'blogPost' } }],
    entries: []
  })
  expect(contentfulImport.mock.calls[0][0].contentFile).toBeUndefined()
  expect(contentfulImport.mock.calls[0][0].useBulkEntries).toBeUndefined()
  expect(createPlainClient).toHaveBeenCalledTimes(1)
  expect(importEntriesWithBulkOperations).toHaveBeenCalledWith(
    expect.objectContaining({
      entries,
      skipContentPublishing: false,
      skipContentUpdates: true,
      transport: { mocked: true }
    })
  )
})

test('it should load bulk entries from content-file and use the selected environment', async () => {
  const entries = [{ sys: { id: 'e1' }, fields: {} }]
  mocks.readFileP.mockResolvedValue(JSON.stringify({ entries }) as never)
  ;(createPlainClient as jest.Mock).mockResolvedValue({ raw: {} })

  await importSpace({
    ...stubArgv,
    context: {
      ...stubArgv.context,
      activeEnvironmentId: 'staging'
    },
    contentFile: './export.json',
    useBulkEntries: true
  })

  expect(mocks.getPath).toHaveBeenCalledWith('./export.json')
  expect(mocks.readFileP).toHaveBeenCalledWith('./export.json', 'utf8')
  expect(createPlainClient).toHaveBeenCalledWith(expect.any(Object), {
    spaceId: 'spaceId',
    environmentId: 'staging'
  })
  expect(importEntriesWithBulkOperations).toHaveBeenCalledWith(
    expect.objectContaining({ entries })
  )
})

test('it should return after the classic phase when there are no bulk entries', async () => {
  const importResult = { imported: true }
  ;(contentfulImport as jest.Mock).mockResolvedValue(importResult)

  await expect(
    importSpace({
      ...stubArgv,
      useBulkEntries: true,
      content: { entries: [] }
    })
  ).resolves.toBe(importResult)

  expect(createPlainClient).not.toHaveBeenCalled()
  expect(importEntriesWithBulkOperations).not.toHaveBeenCalled()
})

test('it should treat a non-array entries property as empty', async () => {
  await importSpace({
    ...stubArgv,
    useBulkEntries: true,
    content: { entries: undefined }
  })

  expect(createPlainClient).not.toHaveBeenCalled()
})

test('it should require a content file when bulk content is not provided', async () => {
  await expect(
    importSpace({
      ...stubArgv,
      useBulkEntries: true,
      content: undefined,
      contentFile: undefined
    })
  ).rejects.toThrow('The --content-file option is required.')

  expect(contentfulImport).not.toHaveBeenCalled()
})

test('it should not use bulk operations for --content-model-only', async () => {
  await importSpace({
    ...stubArgv,
    useBulkEntries: true,
    contentModelOnly: true,
    content: { entries: [{ sys: { id: 'e1' } }] }
  })

  expect(contentfulImport).toHaveBeenCalledTimes(1)
  expect(importEntriesWithBulkOperations).not.toHaveBeenCalled()
})

test('it should reject bulk import without a destination space before importing', async () => {
  await expect(
    importSpace({
      ...stubArgv,
      context: { managementToken: 'managementToken' },
      useBulkEntries: true,
      content: { entries: [{ sys: { id: 'e1' } }] }
    })
  ).rejects.toThrow('A destination space ID is required')

  expect(contentfulImport).not.toHaveBeenCalled()
})

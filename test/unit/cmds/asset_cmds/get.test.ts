jest.mock('../../../../lib/utils/contentful-clients', () => ({
  createManagementClient: jest.fn()
}))
jest.mock('../../../../lib/utils/headers', () => ({
  getHeadersFromOption: jest.fn(v => v || {})
}))
jest.mock('../../../../lib/utils/copyright', () => ({
  copyright: 'Copyright 2026 Contentful'
}))
jest.mock('../../../../lib/utils/actions', () => ({
  confirmation: jest.fn()
}))
jest.mock('../../../../lib/utils/output', () => ({
  output: jest.fn(),
  firstLocaleValue: jest.requireActual('../../../../lib/utils/output').firstLocaleValue
}))
jest.mock('../../../../lib/utils/log', () => ({
  log: jest.fn(),
  warning: jest.fn(),
  logError: jest.fn()
}))

import {handler} from '../../../../lib/cmds/asset_cmds/get'
import {output} from '../../../../lib/utils/output'

const {createManagementClient} = require('../../../../lib/utils/contentful-clients')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>

const mockAsset = {
  sys: {
    id: 'asset-abc',
    version: 3,
    publishedVersion: 2,
    updatedAt: '2024-06-01T00:00:00Z'
  },
  fields: {
    title: {'en-US': 'Hero Image'},
    file: {
      'en-US': {
        fileName: 'hero.png',
        url: '//cdn.example.com/hero.png',
        contentType: 'image/png'
      }
    }
  }
}

const getAssetSub = jest.fn().mockResolvedValue(mockAsset)

const fakeEnvironment = {
  getAsset: getAssetSub
}

const fakeSpace = {
  getEnvironment: jest.fn().mockResolvedValue(fakeEnvironment)
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeSpace.getEnvironment.mockResolvedValue(fakeEnvironment)
  mockCreateManagementClient.mockResolvedValue({
    getSpace: jest.fn().mockResolvedValue(fakeSpace)
  })
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  id: 'asset-abc'
}

describe('asset get — handler', () => {
  it('creates management client with asset-get feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'token-abc',
        feature: 'asset-get'
      })
    )
  })

  it('calls getAsset with the provided ID', async () => {
    await handler(baseArgv)
    expect(getAssetSub).toHaveBeenCalledWith('asset-abc')
  })

  it('routes result through output()', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      mockAsset,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('passes json flag to output when --json is set', async () => {
    await handler({...baseArgv, json: true})
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({json: true}),
      expect.any(Object)
    )
  })

  it('passes quiet flag to output when --quiet is set', async () => {
    await handler({...baseArgv, quiet: true})
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({quiet: true}),
      expect.any(Object)
    )
  })

  it('passes quietExtractor that returns [asset.sys.id]', async () => {
    await handler({...baseArgv, quiet: true})
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(typeof opts.quietExtractor).toBe('function')
    const ids = opts.quietExtractor(mockAsset)
    expect(ids).toEqual(['asset-abc'])
  })

  it('passes keyValue table format with correct rows', async () => {
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(opts.keyValue).toBeDefined()
    const rows = opts.keyValue.rows
    expect(rows).toContainEqual(['ID', 'asset-abc'])
    expect(rows).toContainEqual(['Title', 'Hero Image'])
    expect(rows).toContainEqual(['File Name', 'hero.png'])
    expect(rows).toContainEqual(['URL', '//cdn.example.com/hero.png'])
    expect(rows).toContainEqual(['Content Type', 'image/png'])
    expect(rows).toContainEqual(['Version', '3'])
    expect(rows).toContainEqual(['Status', 'published'])
    expect(rows).toContainEqual(['Updated At', '2024-06-01T00:00:00Z'])
  })

  it('shows draft status for unpublished asset', async () => {
    const draftAsset = {
      sys: {id: 'draft-1', version: 1, updatedAt: '-'},
      fields: {}
    }
    getAssetSub.mockResolvedValueOnce(draftAsset)
    await handler({...baseArgv, id: 'draft-1'})
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    const statusRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'Status')
    expect(statusRow[1]).toBe('draft')
  })

  it('shows archived status when archivedVersion is set', async () => {
    const archivedAsset = {
      sys: {id: 'arch-1', version: 3, archivedVersion: 2, updatedAt: '-'},
      fields: {}
    }
    getAssetSub.mockResolvedValueOnce(archivedAsset)
    await handler({...baseArgv, id: 'arch-1'})
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    const statusRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'Status')
    expect(statusRow[1]).toBe('archived')
  })

  it('shows changed status when version > publishedVersion + 1', async () => {
    const changedAsset = {
      sys: {id: 'chg-1', version: 5, publishedVersion: 2, updatedAt: '-'},
      fields: {}
    }
    getAssetSub.mockResolvedValueOnce(changedAsset)
    await handler({...baseArgv, id: 'chg-1'})
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    const statusRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'Status')
    expect(statusRow[1]).toBe('changed')
  })

  it('shows - for missing title and file fields', async () => {
    const bareAsset = {
      sys: {id: 'bare-1', version: 1, updatedAt: '-'},
      fields: {}
    }
    getAssetSub.mockResolvedValueOnce(bareAsset)
    await handler({...baseArgv, id: 'bare-1'})
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    const titleRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'Title')
    const fileRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'File Name')
    expect(titleRow[1]).toBe('-')
    expect(fileRow[1]).toBe('-')
  })

  describe('ID validation', () => {
    let exitSpy: jest.SpyInstance

    beforeEach(() => {
      exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
        throw new Error(`process.exit(${_code})`)
      })
    })

    afterEach(() => {
      exitSpy.mockRestore()
    })

    it('exits when Asset ID contains invalid characters', async () => {
      await expect(handler({...baseArgv, id: 'invalid id!'})).rejects.toThrow(
        'process.exit(1)'
      )
    })

    it('exits when Asset ID is missing', async () => {
      await expect(handler({...baseArgv, id: ''})).rejects.toThrow('process.exit(1)')
    })
  })
})

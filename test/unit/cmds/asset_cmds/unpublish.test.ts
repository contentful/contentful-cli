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
  output: jest.fn()
}))
jest.mock('../../../../lib/utils/log', () => ({
  log: jest.fn(),
  warning: jest.fn(),
  logError: jest.fn()
}))

import {handler} from '../../../../lib/cmds/asset_cmds/unpublish'
import {output} from '../../../../lib/utils/output'

const {createManagementClient} = require('../../../../lib/utils/contentful-clients')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>

const mockUnpublishedAsset = {
  sys: {
    id: 'asset-abc',
    version: 4,
    updatedAt: '2024-07-01T00:00:00Z'
  },
  fields: {
    title: {'en-US': 'Hero Image'}
  }
}

const mockAsset = {
  sys: {
    id: 'asset-abc',
    version: 3,
    publishedVersion: 2,
    updatedAt: '2024-06-01T00:00:00Z'
  },
  fields: {
    title: {'en-US': 'Hero Image'}
  },
  unpublish: jest.fn().mockResolvedValue(mockUnpublishedAsset)
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
  mockAsset.unpublish.mockResolvedValue(mockUnpublishedAsset)
  getAssetSub.mockResolvedValue(mockAsset)
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  id: 'asset-abc'
}

describe('asset unpublish — handler', () => {
  it('creates management client with asset-unpublish feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'token-abc',
        feature: 'asset-unpublish'
      })
    )
  })

  it('calls getAsset with the provided ID', async () => {
    await handler(baseArgv)
    expect(getAssetSub).toHaveBeenCalledWith('asset-abc')
  })

  it('calls asset.unpublish()', async () => {
    await handler(baseArgv)
    expect(mockAsset.unpublish).toHaveBeenCalled()
  })

  it('routes result through output()', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      mockUnpublishedAsset,
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
    const ids = opts.quietExtractor(mockUnpublishedAsset)
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
    expect(rows).toContainEqual(['Version', '4'])
  })

  describe('dry-run', () => {
    it('does not call asset.unpublish() when --dry-run is set', async () => {
      await handler({...baseArgv, dryRun: true})
      expect(mockAsset.unpublish).not.toHaveBeenCalled()
    })

    it('still returns asset data when --dry-run is set', async () => {
      await handler({...baseArgv, dryRun: true})
      expect(mockOutput).toHaveBeenCalled()
    })
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
      await expect(handler({...baseArgv, id: 'invalid id!'})).rejects.toThrow('process.exit(1)')
    })

    it('exits when Asset ID is missing', async () => {
      await expect(handler({...baseArgv, id: ''})).rejects.toThrow('process.exit(1)')
    })
  })
})

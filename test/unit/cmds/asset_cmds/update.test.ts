jest.mock('../../../../lib/utils/contentful-clients', () => ({
  createPlainClient: jest.fn()
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
  firstLocaleValue: jest.requireActual('../../../../lib/utils/output')
    .firstLocaleValue
}))
jest.mock('../../../../lib/utils/log', () => ({
  log: jest.fn(),
  warning: jest.fn(),
  logError: jest.fn()
}))

import { handler } from '../../../../lib/cmds/asset_cmds/update'
import { output } from '../../../../lib/utils/output'

const {
  createPlainClient
} = require('../../../../lib/utils/contentful-clients')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>

const mockUpdatedAsset = {
  sys: {
    id: 'asset-abc',
    version: 4,
    updatedAt: '2024-07-01T00:00:00Z'
  },
  fields: {
    title: { 'en-US': 'Updated Title' },
    file: {
      'en-US': {
        fileName: 'updated.png',
        url: '//cdn.example.com/updated.png',
        contentType: 'image/png'
      }
    }
  }
}

const mockAsset = {
  sys: {
    id: 'asset-abc',
    version: 3,
    updatedAt: '2024-06-01T00:00:00Z'
  },
  fields: {
    title: { 'en-US': 'Original Title' },
    file: {
      'en-US': {
        fileName: 'original.png',
        url: '//cdn.example.com/original.png',
        contentType: 'image/png'
      }
    }
  }
}

const fakeClient = {
  asset: {
    get: jest.fn().mockResolvedValue(mockAsset),
    update: jest.fn().mockResolvedValue(mockUpdatedAsset)
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  // Reset mockAsset fields to original state before each test
  mockAsset.fields = {
    title: { 'en-US': 'Original Title' },
    file: {
      'en-US': {
        fileName: 'original.png',
        url: '//cdn.example.com/original.png',
        contentType: 'image/png'
      }
    }
  }
  fakeClient.asset.get.mockResolvedValue(mockAsset)
  fakeClient.asset.update.mockResolvedValue(mockUpdatedAsset)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  id: 'asset-abc',
  fields: '{"title": {"en-US": "Updated Title"}}',
  version: 3
}

describe('asset update — handler', () => {
  it('creates plain client with asset-update feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'token-abc',
        feature: 'asset-update'
      }),
      expect.any(Object)
    )
  })

  it('calls asset.get with the provided ID', async () => {
    await handler(baseArgv)
    expect(fakeClient.asset.get).toHaveBeenCalledWith({ assetId: 'asset-abc' })
  })

  it('calls asset.update() after merging fields', async () => {
    await handler(baseArgv)
    expect(fakeClient.asset.update).toHaveBeenCalledWith(
      { assetId: 'asset-abc' },
      mockAsset
    )
  })

  it('merges provided fields into existing asset fields', async () => {
    await handler(baseArgv)
    expect(mockAsset.fields).toMatchObject({
      title: { 'en-US': 'Updated Title' }
    })
  })

  it('routes result through output()', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      mockUpdatedAsset,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('passes json flag to output when --json is set', async () => {
    await handler({ ...baseArgv, json: true })
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ json: true }),
      expect.any(Object)
    )
  })

  it('passes quiet flag to output when --quiet is set', async () => {
    await handler({ ...baseArgv, quiet: true })
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quiet: true }),
      expect.any(Object)
    )
  })

  it('passes quietExtractor that returns [asset.sys.id]', async () => {
    await handler({ ...baseArgv, quiet: true })
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(typeof opts.quietExtractor).toBe('function')
    const ids = opts.quietExtractor(mockUpdatedAsset)
    expect(ids).toEqual(['asset-abc'])
  })

  it('passes keyValue table format with correct rows', async () => {
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(opts.keyValue).toBeDefined()
    const rows = opts.keyValue.rows
    expect(rows).toContainEqual(['ID', 'asset-abc'])
    expect(rows).toContainEqual(['Title', 'Updated Title'])
    expect(rows).toContainEqual(['File Name', 'updated.png'])
    expect(rows).toContainEqual(['Version', '4'])
    expect(rows).toContainEqual(['Updated At', '2024-07-01T00:00:00Z'])
  })

  describe('version conflict', () => {
    let exitSpy: jest.SpyInstance

    beforeEach(() => {
      exitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation((_code?: any) => {
          throw new Error(`process.exit(${_code})`)
        })
    })

    afterEach(() => {
      exitSpy.mockRestore()
    })

    it('rejects when provided version does not match asset version', async () => {
      await expect(handler({ ...baseArgv, version: 99 })).rejects.toThrow(
        'process.exit(1)'
      )
    })
  })

  describe('dry-run', () => {
    it('does not call asset.update() when --dry-run is set', async () => {
      await handler({ ...baseArgv, dryRun: true })
      expect(fakeClient.asset.update).not.toHaveBeenCalled()
    })

    it('still returns merged asset data when --dry-run is set', async () => {
      await handler({ ...baseArgv, dryRun: true })
      expect(mockOutput).toHaveBeenCalled()
    })
  })

  describe('ID validation', () => {
    let exitSpy: jest.SpyInstance

    beforeEach(() => {
      exitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation((_code?: any) => {
          throw new Error(`process.exit(${_code})`)
        })
    })

    afterEach(() => {
      exitSpy.mockRestore()
    })

    it('exits when Asset ID contains invalid characters', async () => {
      await expect(handler({ ...baseArgv, id: 'invalid id!' })).rejects.toThrow(
        'process.exit(1)'
      )
    })

    it('exits when Asset ID is missing', async () => {
      await expect(handler({ ...baseArgv, id: '' })).rejects.toThrow(
        'process.exit(1)'
      )
    })
  })

  describe('JSON fields validation', () => {
    let exitSpy: jest.SpyInstance

    beforeEach(() => {
      exitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation((_code?: any) => {
          throw new Error(`process.exit(${_code})`)
        })
    })

    afterEach(() => {
      exitSpy.mockRestore()
    })

    it('exits when --fields is not valid JSON', async () => {
      await expect(
        handler({ ...baseArgv, fields: 'not-json' })
      ).rejects.toThrow('process.exit(1)')
    })

    it('exits when --fields is a JSON array instead of object', async () => {
      await expect(
        handler({ ...baseArgv, fields: '[1, 2, 3]' })
      ).rejects.toThrow('process.exit(1)')
    })
  })
})

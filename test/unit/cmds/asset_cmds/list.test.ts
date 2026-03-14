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
jest.mock('../../../../lib/utils/pagination', () =>
  jest.fn().mockResolvedValue({items: []})
)

import {handler} from '../../../../lib/cmds/asset_cmds/list'
import {output} from '../../../../lib/utils/output'

const {createManagementClient} = require('../../../../lib/utils/contentful-clients')
const paginate = require('../../../../lib/utils/pagination')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>
const mockPaginate = paginate as jest.MockedFunction<any>

const mockAssets = [
  {
    sys: {
      id: 'asset-1',
      version: 3,
      publishedVersion: 2,
      updatedAt: '2024-01-01T00:00:00Z'
    },
    fields: {
      title: {'en-US': 'My Image'},
      file: {'en-US': {fileName: 'image.jpg', url: '//cdn.example.com/image.jpg', contentType: 'image/jpeg'}}
    }
  },
  {
    sys: {
      id: 'asset-2',
      version: 1,
      updatedAt: '2024-01-02T00:00:00Z'
    },
    fields: {
      title: {'en-US': 'Draft Asset'},
      file: {'en-US': {fileName: 'doc.pdf', url: '//cdn.example.com/doc.pdf', contentType: 'application/pdf'}}
    }
  }
]

const getAssetsSub = jest.fn().mockResolvedValue({items: mockAssets})

const fakeEnvironment = {
  getAssets: getAssetsSub
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
  mockPaginate.mockResolvedValue({items: mockAssets})
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc'
}

describe('asset list — handler', () => {
  it('creates management client with asset-list feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'token-abc',
        feature: 'asset-list'
      })
    )
  })

  it('uses paginate when neither --limit nor --skip are provided', async () => {
    await handler(baseArgv)
    expect(mockPaginate).toHaveBeenCalledWith(
      expect.objectContaining({
        client: fakeEnvironment,
        method: 'getAssets'
      })
    )
    expect(getAssetsSub).not.toHaveBeenCalled()
  })

  it('calls getAssets directly when --limit is provided', async () => {
    await handler({...baseArgv, limit: 10})
    expect(getAssetsSub).toHaveBeenCalledWith({limit: 10})
    expect(mockPaginate).not.toHaveBeenCalled()
  })

  it('calls getAssets directly when --skip is provided', async () => {
    await handler({...baseArgv, skip: 50})
    expect(getAssetsSub).toHaveBeenCalledWith({skip: 50})
    expect(mockPaginate).not.toHaveBeenCalled()
  })

  it('calls getAssets with both limit and skip when both are provided', async () => {
    await handler({...baseArgv, limit: 10, skip: 20})
    expect(getAssetsSub).toHaveBeenCalledWith({limit: 10, skip: 20})
  })

  it('routes result through output()', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      {items: mockAssets},
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

  it('passes quietExtractor that returns asset IDs', async () => {
    await handler({...baseArgv, quiet: true})
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(typeof opts.quietExtractor).toBe('function')
    const ids = opts.quietExtractor({items: mockAssets})
    expect(ids).toEqual(['asset-1', 'asset-2'])
  })

  it('passes tableFormat with correct head columns', async () => {
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(opts.table).toBeDefined()
    expect(opts.table.head).toEqual(['ID', 'Title', 'File Name', 'Status', 'Updated At'])
  })

  it('formats asset rows correctly in table', async () => {
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    const rows = opts.table.rows
    expect(rows[0]).toEqual([
      'asset-1',
      'My Image',
      'image.jpg',
      'published',
      '2024-01-01T00:00:00Z'
    ])
  })

  it('shows draft status for unpublished asset', async () => {
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    const rows = opts.table.rows
    expect(rows[1][3]).toBe('draft')
  })

  it('shows changed status when version > publishedVersion + 1', async () => {
    const changedAsset = {
      sys: {id: 'a3', version: 5, publishedVersion: 2, updatedAt: '-'},
      fields: {}
    }
    mockPaginate.mockResolvedValueOnce({items: [changedAsset]})
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(opts.table.rows[0][3]).toBe('changed')
  })

  it('shows archived status when archivedVersion is set', async () => {
    const archivedAsset = {
      sys: {id: 'a4', version: 3, archivedVersion: 2, updatedAt: '-'},
      fields: {}
    }
    mockPaginate.mockResolvedValueOnce({items: [archivedAsset]})
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(opts.table.rows[0][3]).toBe('archived')
  })

  it('shows - for missing title and fileName', async () => {
    const bareAsset = {
      sys: {id: 'a5', version: 1, updatedAt: '-'},
      fields: {}
    }
    mockPaginate.mockResolvedValueOnce({items: [bareAsset]})
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(opts.table.rows[0][1]).toBe('-')
    expect(opts.table.rows[0][2]).toBe('-')
  })
})

// Mock external dependencies before imports
jest.mock('../../../../lib/utils/contentful-clients', () => ({
  createPlainClient: jest.fn()
}))
jest.mock('../../../../lib/utils/headers', () => ({
  getHeadersFromOption: jest.fn((v) => v || {})
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

import {output} from '../../../../lib/utils/output'
import {logError} from '../../../../lib/utils/log'

const {createPlainClient} = require('../../../../lib/utils/contentful-clients')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>

// Import after mocks are set up
import {handler} from '../../../../lib/cmds/entry_cmds/list'

// Fake entries
const fakeEntry1 = {
  sys: {
    id: 'entry-1',
    contentType: {sys: {id: 'blogPost'}},
    version: 5,
    publishedVersion: 4,
    updatedAt: '2026-01-01T00:00:00Z'
  }
}
const fakeEntry2 = {
  sys: {
    id: 'entry-2',
    contentType: {sys: {id: 'article'}},
    version: 1,
    updatedAt: '2026-01-02T00:00:00Z'
  }
}
const fakeEntriesResult = {
  items: [fakeEntry1, fakeEntry2],
  total: 2
}

const fakeClient = {
  entry: {
    getMany: jest.fn().mockResolvedValue(fakeEntriesResult)
  }
}

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  header: undefined
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeClient.entry.getMany.mockResolvedValue(fakeEntriesResult)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

describe('entry list — handler', () => {
  it('calls entry.getMany with empty query when no filters provided', async () => {
    await handler(baseArgv)
    expect(fakeClient.entry.getMany).toHaveBeenCalledWith(
      expect.objectContaining({query: {}})
    )
  })

  it('calls entry.getMany with limit in query when --limit is provided', async () => {
    await handler({...baseArgv, limit: 50})
    expect(fakeClient.entry.getMany).toHaveBeenCalledWith(
      expect.objectContaining({query: expect.objectContaining({limit: 50})})
    )
  })

  it('calls entry.getMany with skip in query when --skip is provided', async () => {
    await handler({...baseArgv, skip: 10})
    expect(fakeClient.entry.getMany).toHaveBeenCalledWith(
      expect.objectContaining({query: expect.objectContaining({skip: 10})})
    )
  })

  it('passes content_type to query when --content-type is given', async () => {
    await handler({...baseArgv, contentType: 'blogPost'})
    expect(fakeClient.entry.getMany).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({content_type: 'blogPost'})
      })
    )
  })

  it('passes content_type and limit when both are given', async () => {
    await handler({...baseArgv, contentType: 'article', limit: 20})
    expect(fakeClient.entry.getMany).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({content_type: 'article', limit: 20})
      })
    )
  })

  it('calls output with result data', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      fakeEntriesResult,
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

  it('passes quietExtractor that returns entry IDs', async () => {
    await handler({...baseArgv, quiet: true})
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor(fakeEntriesResult)
    expect(ids).toEqual(['entry-1', 'entry-2'])
  })

  it('passes tableFormat with correct head', async () => {
    await handler(baseArgv)
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.table).toBeDefined()
    expect(opts.table.head).toEqual(['ID', 'Content Type', 'Status', 'Updated At'])
  })

  it('tableFormat rows include entry id and content type', async () => {
    await handler(baseArgv)
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    const rows = opts.table.rows
    expect(rows[0][0]).toBe('entry-1')
    expect(rows[0][1]).toBe('blogPost')
    expect(rows[1][0]).toBe('entry-2')
    expect(rows[1][1]).toBe('article')
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'entry-list'}),
      expect.any(Object)
    )
  })
})

describe('entry list — entry status', () => {
  it('shows "draft" for entries with no publishedVersion', async () => {
    const draftEntry = {
      sys: {id: 'draft-entry', version: 1, updatedAt: '2026-01-01T00:00:00Z'}
    }
    fakeClient.entry.getMany.mockResolvedValueOnce({items: [draftEntry], total: 1})
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    const rows = opts.table.rows
    expect(rows[0][2]).toBe('draft')
  })

  it('shows "published" for entries where version equals publishedVersion + 1', async () => {
    const publishedEntry = {
      sys: {
        id: 'pub-entry',
        version: 3,
        publishedVersion: 2,
        updatedAt: '2026-01-01T00:00:00Z'
      }
    }
    fakeClient.entry.getMany.mockResolvedValueOnce({items: [publishedEntry], total: 1})
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    expect(opts.table.rows[0][2]).toBe('published')
  })

  it('shows "changed" for entries where version > publishedVersion + 1', async () => {
    const changedEntry = {
      sys: {
        id: 'changed-entry',
        version: 5,
        publishedVersion: 2,
        updatedAt: '2026-01-01T00:00:00Z'
      }
    }
    fakeClient.entry.getMany.mockResolvedValueOnce({items: [changedEntry], total: 1})
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    expect(opts.table.rows[0][2]).toBe('changed')
  })

  it('shows "archived" for entries with archivedVersion set', async () => {
    const archivedEntry = {
      sys: {
        id: 'archived-entry',
        version: 2,
        archivedVersion: 1,
        updatedAt: '2026-01-01T00:00:00Z'
      }
    }
    fakeClient.entry.getMany.mockResolvedValueOnce({items: [archivedEntry], total: 1})
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    expect(opts.table.rows[0][2]).toBe('archived')
  })
})

describe('entry list — error handling', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('calls logError and exits when SDK throws', async () => {
    const err = new Error('API error')
    mockCreatePlainClient.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit')
    expect(mockLogError).toHaveBeenCalledWith(err)
  })
})

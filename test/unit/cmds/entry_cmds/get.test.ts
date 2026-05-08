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
import {handler} from '../../../../lib/cmds/entry_cmds/get'

// Fake entry
const fakeEntry = {
  sys: {
    id: 'entry-abc',
    contentType: {sys: {id: 'blogPost'}},
    version: 3,
    publishedVersion: 2,
    updatedAt: '2026-01-15T00:00:00Z'
  },
  fields: {
    title: {'en-US': 'Hello World'}
  }
}

const fakeClient = {
  entry: {
    get: jest.fn().mockResolvedValue(fakeEntry)
  }
}

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  header: undefined,
  id: 'entry-abc'
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeClient.entry.get.mockResolvedValue(fakeEntry)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

describe('entry get — handler', () => {
  it('calls entry.get with the provided ID', async () => {
    await handler(baseArgv)
    expect(fakeClient.entry.get).toHaveBeenCalledWith({entryId: 'entry-abc'})
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'entry-get'}),
      expect.any(Object)
    )
  })

  it('calls output with entry data', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      fakeEntry,
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

  it('passes quietExtractor that returns a single entry ID', async () => {
    await handler({...baseArgv, quiet: true})
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor(fakeEntry)
    expect(ids).toEqual(['entry-abc'])
  })

  it('passes keyValue tableFormat with correct rows', async () => {
    await handler(baseArgv)
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.keyValue).toBeDefined()
    const rows = opts.keyValue.rows
    const idRow = rows.find((r: string[]) => r[0] === 'ID')
    expect(idRow).toBeDefined()
    expect(idRow[1]).toBe('entry-abc')
  })

  it('tableFormat includes Content Type row', async () => {
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    const rows = opts.keyValue.rows
    const ctRow = rows.find((r: string[]) => r[0] === 'Content Type')
    expect(ctRow).toBeDefined()
    expect(ctRow[1]).toBe('blogPost')
  })

  it('tableFormat includes Status row showing "published"', async () => {
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    const rows = opts.keyValue.rows
    const statusRow = rows.find((r: string[]) => r[0] === 'Status')
    expect(statusRow).toBeDefined()
    expect(statusRow[1]).toBe('published')
  })

  it('tableFormat shows "-" for Content Type when missing', async () => {
    const entryWithoutCt = {
      sys: {id: 'entry-no-ct', version: 1, updatedAt: '2026-01-01T00:00:00Z'}
    }
    fakeClient.entry.get.mockResolvedValueOnce(entryWithoutCt)
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    const rows = opts.keyValue.rows
    const ctRow = rows.find((r: string[]) => r[0] === 'Content Type')
    expect(ctRow[1]).toBe('-')
  })
})

describe('entry get — ID validation', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('throws when ID contains invalid characters', async () => {
    await expect(
      handler({...baseArgv, id: 'invalid entry id!'})
    ).rejects.toThrow('process.exit')
  })

  it('throws when ID is empty', async () => {
    await expect(handler({...baseArgv, id: ''})).rejects.toThrow('process.exit')
  })
})

describe('entry get — entry status', () => {
  it('shows "draft" for entry with no publishedVersion', async () => {
    fakeClient.entry.get.mockResolvedValueOnce({
      sys: {id: 'draft', version: 1, updatedAt: '2026-01-01T00:00:00Z'}
    })
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    const statusRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'Status')
    expect(statusRow[1]).toBe('draft')
  })

  it('shows "changed" when version > publishedVersion + 1', async () => {
    fakeClient.entry.get.mockResolvedValueOnce({
      sys: {id: 'changed', version: 5, publishedVersion: 2, updatedAt: '2026-01-01T00:00:00Z'}
    })
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    const statusRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'Status')
    expect(statusRow[1]).toBe('changed')
  })

  it('shows "archived" when archivedVersion is set', async () => {
    fakeClient.entry.get.mockResolvedValueOnce({
      sys: {id: 'archived', version: 2, archivedVersion: 1, updatedAt: '2026-01-01T00:00:00Z'}
    })
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    const statusRow = opts.keyValue.rows.find((r: string[]) => r[0] === 'Status')
    expect(statusRow[1]).toBe('archived')
  })
})

describe('entry get — error handling', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('calls logError and exits when entry.get throws', async () => {
    const err = Object.assign(new Error('Not Found'), {response: {status: 404}})
    fakeClient.entry.get.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit')
    expect(mockLogError).toHaveBeenCalledWith(err)
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('exits with code 2 on 5xx error', async () => {
    const err = Object.assign(new Error('Server Error'), {response: {status: 500}})
    fakeClient.entry.get.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit(2)')
    expect(exitSpy).toHaveBeenCalledWith(2)
  })
})

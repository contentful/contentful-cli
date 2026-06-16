// Mock external dependencies before imports
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
  output: jest.fn()
}))
jest.mock('../../../../lib/utils/log', () => ({
  log: jest.fn(),
  warning: jest.fn(),
  logError: jest.fn()
}))

import { output } from '../../../../lib/utils/output'
import { logError } from '../../../../lib/utils/log'

const {
  createPlainClient
} = require('../../../../lib/utils/contentful-clients')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>

// Import after mocks are set up
import { handler } from '../../../../lib/cmds/entry_cmds/unpublish'

const fakeEntry = {
  sys: {
    id: 'entry-abc',
    contentType: { sys: { id: 'blogPost' } },
    version: 5,
    publishedVersion: 4
  }
}

const unpublishedEntry = {
  sys: { id: 'entry-abc', version: 6 }
}

const fakeClient = {
  entry: {
    get: jest.fn().mockResolvedValue(fakeEntry),
    unpublish: jest.fn().mockResolvedValue(unpublishedEntry)
  }
}

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  header: undefined,
  id: 'entry-abc',
  yes: true
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeClient.entry.get.mockResolvedValue(fakeEntry)
  fakeClient.entry.unpublish.mockResolvedValue(unpublishedEntry)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

describe('entry unpublish — handler', () => {
  it('fetches entry and calls entry.unpublish()', async () => {
    await handler(baseArgv)
    expect(fakeClient.entry.get).toHaveBeenCalledWith({ entryId: 'entry-abc' })
    expect(fakeClient.entry.unpublish).toHaveBeenCalledWith({
      entryId: 'entry-abc'
    })
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'entry-unpublish' }),
      expect.any(Object)
    )
  })

  it('calls output with unpublish result', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      expect.any(Object),
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

  it('passes quietExtractor that returns entry ID from sys', async () => {
    await handler({ ...baseArgv, quiet: true })
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor({ sys: { id: 'entry-abc' } })
    expect(ids).toEqual(['entry-abc'])
  })

  it('passes quietExtractor that returns entry ID from plain id field', async () => {
    await handler({ ...baseArgv, quiet: true })
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    const ids = opts.quietExtractor({ id: 'entry-abc' })
    expect(ids).toEqual(['entry-abc'])
  })

  it('tableFormat shows Unpublished action', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow[1]).toBe('Unpublished')
  })

  it('tableFormat includes ID row', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const idRow = rows.find((r: string[]) => r[0] === 'ID')
    expect(idRow).toBeDefined()
  })
})

describe('entry unpublish — dry run', () => {
  it('does not call entry.unpublish() when --dry-run is set', async () => {
    await handler({ ...baseArgv, dryRun: true })
    expect(fakeClient.entry.unpublish).not.toHaveBeenCalled()
  })

  it('returns dry run info including action and id', async () => {
    await handler({ ...baseArgv, dryRun: true })
    const data = mockOutput.mock.calls[0][0] as any
    expect(data.dryRun).toBe(true)
    expect(data.action).toBe('unpublish')
    expect(data.id).toBe('entry-abc')
  })

  it('tableFormat shows Would unpublish action on dry run', async () => {
    await handler({ ...baseArgv, dryRun: true })
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow[1]).toBe('Would unpublish')
  })

  it('includes currentlyPublished in dry run output', async () => {
    await handler({ ...baseArgv, dryRun: true })
    const data = mockOutput.mock.calls[0][0] as any
    expect(data).toHaveProperty('currentlyPublished')
  })
})

describe('entry unpublish — ID validation', () => {
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
      handler({ ...baseArgv, id: 'invalid entry id!' })
    ).rejects.toThrow('process.exit')
  })

  it('throws when ID is empty', async () => {
    await expect(handler({ ...baseArgv, id: '' })).rejects.toThrow(
      'process.exit'
    )
  })
})

describe('entry unpublish — error handling', () => {
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
    const err = Object.assign(new Error('Not Found'), {
      response: { status: 404 }
    })
    fakeClient.entry.get.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit')
    expect(mockLogError).toHaveBeenCalledWith(err)
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('exits with code 2 on 5xx error', async () => {
    const err = Object.assign(new Error('Server Error'), {
      response: { status: 500 }
    })
    fakeClient.entry.get.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit(2)')
    expect(exitSpy).toHaveBeenCalledWith(2)
  })
})

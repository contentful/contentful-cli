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
import { handler } from '../../../../lib/cmds/entry_cmds/update'

const updatedEntry = {
  sys: {
    id: 'entry-abc',
    contentType: { sys: { id: 'blogPost' } },
    version: 6
  },
  fields: { title: { 'en-US': 'Updated Title' } }
}

// makeEntry returns a fresh entry object each time to avoid cross-test mutation
const makeEntry = (overrides?: Partial<any>) => {
  const base = {
    sys: {
      id: 'entry-abc',
      contentType: { sys: { id: 'blogPost' } },
      version: 5
    },
    fields: {
      title: { 'en-US': 'Original Title' }
    }
  }
  if (overrides) Object.assign(base, overrides)
  return base
}

let fakeEntry = makeEntry()

const fakeClient = {
  entry: {
    get: jest.fn(),
    update: jest.fn().mockResolvedValue(updatedEntry)
  }
}

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  header: undefined,
  id: 'entry-abc',
  version: 5,
  fields: '{"title": {"en-US": "Updated Title"}}'
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeEntry = makeEntry()
  fakeClient.entry.get.mockResolvedValue(fakeEntry)
  fakeClient.entry.update.mockResolvedValue(updatedEntry)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

describe('entry update — handler', () => {
  it('fetches the entry and merges fields', async () => {
    await handler(baseArgv)
    expect(fakeClient.entry.get).toHaveBeenCalledWith({ entryId: 'entry-abc' })
    expect(fakeEntry.fields).toMatchObject({
      title: { 'en-US': 'Updated Title' }
    })
  })

  it('calls entry.update() after merging fields', async () => {
    await handler(baseArgv)
    expect(fakeClient.entry.update).toHaveBeenCalledWith(
      { entryId: 'entry-abc' },
      fakeEntry
    )
  })

  it('calls output with updated entry data', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      updatedEntry,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'entry-update' }),
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

  it('passes quietExtractor that returns the entry ID', async () => {
    await handler({ ...baseArgv, quiet: true })
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor(updatedEntry)
    expect(ids).toEqual(['entry-abc'])
  })

  it('passes keyValue tableFormat with correct rows', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    expect(opts.keyValue).toBeDefined()
    const rows = opts.keyValue.rows
    const idRow = rows.find((r: string[]) => r[0] === 'ID')
    expect(idRow).toBeDefined()
    expect(idRow[1]).toBe('entry-abc')
  })

  it('tableFormat shows "Updated" action for real update', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow).toBeDefined()
    expect(actionRow[1]).toBe('Updated')
  })
})

describe('entry update — version conflict', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('rejects version mismatch with clear error containing current version', async () => {
    // Entry is at version 5, but user provides version 3
    await expect(handler({ ...baseArgv, version: 3 })).rejects.toThrow(
      'process.exit'
    )
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('version 5')
      })
    )
  })

  it('error message includes the provided version', async () => {
    await expect(handler({ ...baseArgv, version: 3 })).rejects.toThrow(
      'process.exit'
    )
    const err = mockLogError.mock.calls[0][0] as Error
    expect(err.message).toContain('--version 3')
  })
})

describe('entry update — dry run', () => {
  it('fetches entry but does not call entry.update()', async () => {
    await handler({ ...baseArgv, dryRun: true })
    expect(fakeClient.entry.get).toHaveBeenCalledWith({ entryId: 'entry-abc' })
    expect(fakeClient.entry.update).not.toHaveBeenCalled()
  })

  it('returns dry run result with action and fields', async () => {
    await handler({ ...baseArgv, dryRun: true })
    const data = mockOutput.mock.calls[0][0] as any
    expect(data.dryRun).toBe(true)
    expect(data.action).toBe('update')
    expect(data.id).toBe('entry-abc')
    expect(data.currentVersion).toBe(5)
    expect(data.fieldsToUpdate).toEqual({ title: { 'en-US': 'Updated Title' } })
  })

  it('tableFormat shows "Would update" action for dry run', async () => {
    await handler({ ...baseArgv, dryRun: true })
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow).toBeDefined()
    expect(actionRow[1]).toBe('Would update')
  })

  it('rejects version mismatch even in dry run', async () => {
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((_code?: any) => {
        throw new Error(`process.exit(${_code})`)
      })
    try {
      await expect(
        handler({ ...baseArgv, dryRun: true, version: 99 })
      ).rejects.toThrow('process.exit')
    } finally {
      exitSpy.mockRestore()
    }
  })
})

describe('entry update — validation', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('throws when entry ID contains invalid characters', async () => {
    await expect(handler({ ...baseArgv, id: 'invalid id!' })).rejects.toThrow(
      'process.exit'
    )
  })

  it('throws when fields JSON is invalid', async () => {
    await expect(
      handler({ ...baseArgv, fields: 'not-valid-json' })
    ).rejects.toThrow('process.exit')
  })

  it('throws when fields is an array instead of object', async () => {
    await expect(handler({ ...baseArgv, fields: '[1, 2, 3]' })).rejects.toThrow(
      'process.exit'
    )
  })

  it('throws when version is not a positive integer', async () => {
    await expect(handler({ ...baseArgv, version: 0 })).rejects.toThrow(
      'process.exit'
    )
  })

  it('throws when version is negative', async () => {
    await expect(handler({ ...baseArgv, version: -1 })).rejects.toThrow(
      'process.exit'
    )
  })
})

describe('entry update — error handling', () => {
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

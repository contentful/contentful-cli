// Mock external dependencies before imports
jest.mock('../../../../lib/utils/contentful-clients', () => ({
  createManagementClient: jest.fn()
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
import {logError, warning} from '../../../../lib/utils/log'

const {createManagementClient} = require('../../../../lib/utils/contentful-clients')
const {confirmation} = require('../../../../lib/utils/actions')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockWarning = warning as jest.MockedFunction<typeof warning>
const mockConfirmation = confirmation as jest.MockedFunction<any>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>

// Import after mocks are set up
import {handler} from '../../../../lib/cmds/entry_cmds/delete'

// Draft entry (no publishedVersion) — can be deleted
const draftEntry = {
  sys: {
    id: 'entry-draft',
    contentType: {sys: {id: 'blogPost'}},
    version: 2
  },
  delete: jest.fn()
}

// Published entry — cannot be deleted directly
const publishedEntry = {
  sys: {
    id: 'entry-pub',
    contentType: {sys: {id: 'blogPost'}},
    version: 5,
    publishedVersion: 4
  },
  delete: jest.fn()
}

const fakeEnvironment = {
  getEntry: jest.fn().mockResolvedValue(draftEntry)
}
const fakeSpace = {
  getEnvironment: jest.fn().mockResolvedValue(fakeEnvironment)
}

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  header: undefined,
  id: 'entry-draft',
  yes: true
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeSpace.getEnvironment.mockResolvedValue(fakeEnvironment)
  fakeEnvironment.getEntry.mockResolvedValue(draftEntry)
  draftEntry.delete.mockResolvedValue(undefined)
  publishedEntry.delete.mockResolvedValue(undefined)
  mockConfirmation.mockResolvedValue(true)
  mockCreateManagementClient.mockResolvedValue({
    getSpace: jest.fn().mockResolvedValue(fakeSpace)
  })
})

describe('entry delete — handler', () => {
  it('fetches entry and calls entry.delete() for draft entry', async () => {
    await handler(baseArgv)
    expect(fakeEnvironment.getEntry).toHaveBeenCalledWith('entry-draft')
    expect(draftEntry.delete).toHaveBeenCalled()
  })

  it('creates management client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'entry-delete'})
    )
  })

  it('returns deleted result with id', async () => {
    await handler(baseArgv)
    const data = mockOutput.mock.calls[0][0] as any
    expect(data.deleted).toBe(true)
    expect(data.id).toBe('entry-draft')
  })

  it('calls output after deleting', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      expect.any(Object),
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

  it('passes quietExtractor that returns entry ID', async () => {
    await handler({...baseArgv, quiet: true})
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor({id: 'entry-draft'})
    expect(ids).toEqual(['entry-draft'])
  })

  it('tableFormat shows Deleted action', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow[1]).toBe('Deleted')
  })

  it('tableFormat includes ID row', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const idRow = rows.find((r: string[]) => r[0] === 'ID')
    expect(idRow[1]).toBe('entry-draft')
  })
})

describe('entry delete — rejects published entries', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
    fakeEnvironment.getEntry.mockResolvedValue(publishedEntry)
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('throws with clear error message when entry is published', async () => {
    await expect(handler({...baseArgv, id: 'entry-pub'})).rejects.toThrow(
      'process.exit'
    )
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('currently published')
      })
    )
  })

  it('does not call entry.delete() when entry is published', async () => {
    await expect(handler({...baseArgv, id: 'entry-pub'})).rejects.toThrow(
      'process.exit'
    )
    expect(publishedEntry.delete).not.toHaveBeenCalled()
  })
})

describe('entry delete — confirmation', () => {
  it('prompts for confirmation when --yes is not passed', async () => {
    mockConfirmation.mockResolvedValue(true)
    await handler({...baseArgv, yes: undefined})
    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.stringContaining('delete')
    )
  })

  it('skips confirmation when --yes is passed', async () => {
    await handler({...baseArgv, yes: true})
    expect(mockConfirmation).not.toHaveBeenCalled()
  })

  it('aborts operation when user declines confirmation', async () => {
    mockConfirmation.mockResolvedValue(false)
    await handler({...baseArgv, yes: undefined})
    expect(draftEntry.delete).not.toHaveBeenCalled()
    expect(mockWarning).toHaveBeenCalledWith('Operation aborted.')
  })
})

describe('entry delete — dry run', () => {
  it('does not call entry.delete() when --dry-run is set', async () => {
    await handler({...baseArgv, dryRun: true})
    expect(draftEntry.delete).not.toHaveBeenCalled()
  })

  it('returns dry run info including action, id, and published status', async () => {
    await handler({...baseArgv, dryRun: true})
    const data = mockOutput.mock.calls[0][0] as any
    expect(data.dryRun).toBe(true)
    expect(data.action).toBe('delete')
    expect(data.id).toBe('entry-draft')
    expect(data).toHaveProperty('published')
  })

  it('tableFormat shows Would delete action on dry run', async () => {
    await handler({...baseArgv, dryRun: true})
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow[1]).toBe('Would delete')
  })

  it('includes contentType in dry run output', async () => {
    await handler({...baseArgv, dryRun: true})
    const data = mockOutput.mock.calls[0][0] as any
    expect(data.contentType).toBe('blogPost')
  })
})

describe('entry delete — ID validation', () => {
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

describe('entry delete — error handling', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('calls logError and exits when getEntry throws', async () => {
    const err = Object.assign(new Error('Not Found'), {response: {status: 404}})
    fakeEnvironment.getEntry.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit')
    expect(mockLogError).toHaveBeenCalledWith(err)
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('exits with code 2 on 5xx error', async () => {
    const err = Object.assign(new Error('Server Error'), {response: {status: 500}})
    fakeEnvironment.getEntry.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit(2)')
    expect(exitSpy).toHaveBeenCalledWith(2)
  })
})

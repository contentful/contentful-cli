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
import {logError} from '../../../../lib/utils/log'

const {createManagementClient} = require('../../../../lib/utils/contentful-clients')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>

// Import after mocks are set up
import {handler} from '../../../../lib/cmds/entry_cmds/unarchive'

const fakeEntry = {
  sys: {
    id: 'entry-abc',
    contentType: {sys: {id: 'blogPost'}},
    version: 5,
    archivedVersion: 4
  },
  unarchive: jest.fn()
}

const fakeEnvironment = {
  getEntry: jest.fn().mockResolvedValue(fakeEntry)
}
const fakeSpace = {
  getEnvironment: jest.fn().mockResolvedValue(fakeEnvironment)
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
  fakeSpace.getEnvironment.mockResolvedValue(fakeEnvironment)
  fakeEnvironment.getEntry.mockResolvedValue(fakeEntry)
  fakeEntry.unarchive.mockResolvedValue({
    sys: {id: 'entry-abc', version: 6}
  })
  mockCreateManagementClient.mockResolvedValue({
    getSpace: jest.fn().mockResolvedValue(fakeSpace)
  })
})

describe('entry unarchive — handler', () => {
  it('fetches entry and calls entry.unarchive()', async () => {
    await handler(baseArgv)
    expect(fakeEnvironment.getEntry).toHaveBeenCalledWith('entry-abc')
    expect(fakeEntry.unarchive).toHaveBeenCalled()
  })

  it('creates management client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'entry-unarchive'})
    )
  })

  it('calls output with unarchive result', async () => {
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

  it('passes quietExtractor that returns entry ID from sys', async () => {
    await handler({...baseArgv, quiet: true})
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor({sys: {id: 'entry-abc'}})
    expect(ids).toEqual(['entry-abc'])
  })

  it('passes quietExtractor that returns entry ID from plain id field', async () => {
    await handler({...baseArgv, quiet: true})
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    const ids = opts.quietExtractor({id: 'entry-abc'})
    expect(ids).toEqual(['entry-abc'])
  })

  it('tableFormat shows Unarchived action', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow[1]).toBe('Unarchived')
  })

  it('tableFormat includes ID row', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const idRow = rows.find((r: string[]) => r[0] === 'ID')
    expect(idRow).toBeDefined()
  })
})

describe('entry unarchive — dry run', () => {
  it('does not call entry.unarchive() when --dry-run is set', async () => {
    await handler({...baseArgv, dryRun: true})
    expect(fakeEntry.unarchive).not.toHaveBeenCalled()
  })

  it('returns dry run info including action and id', async () => {
    await handler({...baseArgv, dryRun: true})
    const data = mockOutput.mock.calls[0][0] as any
    expect(data.dryRun).toBe(true)
    expect(data.action).toBe('unarchive')
    expect(data.id).toBe('entry-abc')
  })

  it('tableFormat shows Would unarchive action on dry run', async () => {
    await handler({...baseArgv, dryRun: true})
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const actionRow = rows.find((r: string[]) => r[0] === 'Action')
    expect(actionRow[1]).toBe('Would unarchive')
  })

  it('includes currentlyArchived in dry run output', async () => {
    await handler({...baseArgv, dryRun: true})
    const data = mockOutput.mock.calls[0][0] as any
    expect(data).toHaveProperty('currentlyArchived')
  })
})

describe('entry unarchive — ID validation', () => {
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

describe('entry unarchive — error handling', () => {
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

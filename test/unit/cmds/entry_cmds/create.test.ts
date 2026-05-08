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
import {handler} from '../../../../lib/cmds/entry_cmds/create'

// Fake created entry
const fakeCreatedEntry = {
  sys: {
    id: 'new-entry-123',
    contentType: {sys: {id: 'blogPost'}},
    version: 1
  },
  fields: {
    title: {'en-US': 'Hello World'}
  }
}

const fakeContentType = {
  sys: {id: 'blogPost'}
}

const fakeClient = {
  entry: {
    create: jest.fn().mockResolvedValue(fakeCreatedEntry),
    createWithId: jest.fn().mockResolvedValue(fakeCreatedEntry)
  },
  contentType: {
    get: jest.fn().mockResolvedValue(fakeContentType)
  }
}

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  header: undefined,
  contentType: 'blogPost',
  fields: '{"title": {"en-US": "Hello World"}}'
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeClient.entry.create.mockResolvedValue(fakeCreatedEntry)
  fakeClient.entry.createWithId.mockResolvedValue(fakeCreatedEntry)
  fakeClient.contentType.get.mockResolvedValue(fakeContentType)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

describe('entry create — handler', () => {
  it('creates entry with content type and fields', async () => {
    await handler(baseArgv)
    expect(fakeClient.entry.create).toHaveBeenCalledWith(
      {contentTypeId: 'blogPost'},
      {fields: {title: {'en-US': 'Hello World'}}}
    )
  })

  it('uses entry.createWithId when --id is provided', async () => {
    await handler({...baseArgv, id: 'my-custom-id'})
    expect(fakeClient.entry.createWithId).toHaveBeenCalledWith(
      {contentTypeId: 'blogPost', entryId: 'my-custom-id'},
      {fields: {title: {'en-US': 'Hello World'}}}
    )
    expect(fakeClient.entry.create).not.toHaveBeenCalled()
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'entry-create'}),
      expect.any(Object)
    )
  })

  it('calls output with created entry data', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      fakeCreatedEntry,
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

  it('passes quietExtractor that returns the entry ID', async () => {
    await handler({...baseArgv, quiet: true})
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor(fakeCreatedEntry)
    expect(ids).toEqual(['new-entry-123'])
  })

  it('passes keyValue tableFormat with correct rows', async () => {
    await handler(baseArgv)
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.keyValue).toBeDefined()
    const rows = opts.keyValue.rows
    const idRow = rows.find((r: string[]) => r[0] === 'ID')
    expect(idRow).toBeDefined()
    expect(idRow[1]).toBe('new-entry-123')
  })

  it('tableFormat includes Content Type row', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const ctRow = rows.find((r: string[]) => r[0] === 'Content Type')
    expect(ctRow).toBeDefined()
    expect(ctRow[1]).toBe('blogPost')
  })

  it('tableFormat includes Version row', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    const rows = opts.keyValue.rows
    const versionRow = rows.find((r: string[]) => r[0] === 'Version')
    expect(versionRow).toBeDefined()
    expect(versionRow[1]).toBe('1')
  })
})

describe('entry create — dry run', () => {
  it('validates content type exists without creating entry', async () => {
    await handler({...baseArgv, dryRun: true})
    expect(fakeClient.contentType.get).toHaveBeenCalledWith({contentTypeId: 'blogPost'})
    expect(fakeClient.entry.create).not.toHaveBeenCalled()
    expect(fakeClient.entry.createWithId).not.toHaveBeenCalled()
  })

  it('returns dry run result with action and fields', async () => {
    await handler({...baseArgv, dryRun: true})
    const outputCall = mockOutput.mock.calls[0]
    const data = outputCall[0] as any
    expect(data.dryRun).toBe(true)
    expect(data.action).toBe('create')
    expect(data.contentType).toBe('blogPost')
    expect(data.fields).toEqual({title: {'en-US': 'Hello World'}})
  })

  it('returns auto-generated entryId placeholder when no id given', async () => {
    await handler({...baseArgv, dryRun: true})
    const outputCall = mockOutput.mock.calls[0]
    const data = outputCall[0] as any
    expect(data.entryId).toBe('(auto-generated)')
  })

  it('returns custom entryId when --id is provided', async () => {
    await handler({...baseArgv, dryRun: true, id: 'my-custom-id'})
    const outputCall = mockOutput.mock.calls[0]
    const data = outputCall[0] as any
    expect(data.entryId).toBe('my-custom-id')
  })

  it('quietExtractor returns entryId from dry run result', async () => {
    await handler({...baseArgv, dryRun: true})
    const opts = mockOutput.mock.calls[0][2] as any
    const ids = opts.quietExtractor({entryId: '(auto-generated)'})
    expect(ids).toEqual(['(auto-generated)'])
  })
})

describe('entry create — validation', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('throws when content type ID contains invalid characters', async () => {
    await expect(
      handler({...baseArgv, contentType: 'invalid type!'})
    ).rejects.toThrow('process.exit')
  })

  it('throws when fields JSON is invalid', async () => {
    await expect(
      handler({...baseArgv, fields: 'not-valid-json'})
    ).rejects.toThrow('process.exit')
  })

  it('throws when fields is an array instead of object', async () => {
    await expect(
      handler({...baseArgv, fields: '[1, 2, 3]'})
    ).rejects.toThrow('process.exit')
  })

  it('throws when custom entry ID contains invalid characters', async () => {
    await expect(
      handler({...baseArgv, id: 'invalid id!'})
    ).rejects.toThrow('process.exit')
  })
})

describe('entry create — error handling', () => {
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('calls logError and exits when entry.create throws', async () => {
    const err = Object.assign(new Error('Unprocessable Entity'), {
      response: {status: 422}
    })
    fakeClient.entry.create.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit')
    expect(mockLogError).toHaveBeenCalledWith(err)
  })

  it('exits with code 2 on 5xx error', async () => {
    const err = Object.assign(new Error('Server Error'), {response: {status: 500}})
    fakeClient.entry.create.mockRejectedValueOnce(err)
    await expect(handler(baseArgv)).rejects.toThrow('process.exit(2)')
    expect(exitSpy).toHaveBeenCalledWith(2)
  })
})

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

import { handler } from '../../../../lib/cmds/content-type_cmds/list'
import { output } from '../../../../lib/utils/output'
import { logError } from '../../../../lib/utils/log'

const {
  createPlainClient
} = require('../../../../lib/utils/contentful-clients')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>

const mockContentTypes = {
  items: [
    { name: 'Blog Post', sys: { id: 'blogPost' } },
    { name: 'Page', sys: { id: 'page' } },
    { name: 'Author', sys: { id: 'author' } }
  ]
}

const fakeClient = {
  contentType: {
    getMany: jest.fn().mockResolvedValue(mockContentTypes)
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeClient.contentType.getMany.mockResolvedValue(mockContentTypes)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  order: 'name,sys.id'
}

describe('content-type list', () => {
  it('calls contentType.getMany with order query', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.getMany).toHaveBeenCalledWith({
      query: { order: 'name,sys.id' }
    })
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'content_type-list' }),
      expect.any(Object)
    )
  })

  it('passes result to output', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      mockContentTypes,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('passes --json flag to output', async () => {
    await handler({ ...baseArgv, json: true })
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ json: true }),
      expect.any(Object)
    )
  })

  it('passes --quiet flag to output', async () => {
    await handler({ ...baseArgv, quiet: true })
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quiet: true }),
      expect.any(Object)
    )
  })

  it('passes quietExtractor that returns content type IDs', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    expect(opts.quietExtractor).toBeDefined()
    const ids = opts.quietExtractor(mockContentTypes)
    expect(ids).toEqual(['blogPost', 'page', 'author'])
  })

  it('passes tableFormat with correct head', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    expect(opts.table).toBeDefined()
    expect(opts.table.head).toEqual(['Content Type Name', 'Content Type ID'])
  })

  it('formats content type rows correctly', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    expect(opts.table.rows).toEqual([
      ['Blog Post', 'blogPost'],
      ['Page', 'page'],
      ['Author', 'author']
    ])
  })

  it('exits with code 1 on client error', async () => {
    const err = Object.assign(new Error('Not Found'), {
      response: { status: 404 }
    })
    fakeClient.contentType.getMany.mockRejectedValueOnce(err)
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((_code?: any) => {
        throw new Error(`process.exit(${_code})`)
      })
    try {
      await expect(handler(baseArgv)).rejects.toThrow('process.exit(1)')
      expect(mockLogError).toHaveBeenCalledWith(err)
    } finally {
      exitSpy.mockRestore()
    }
  })
})

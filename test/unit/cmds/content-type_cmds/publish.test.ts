// Mock all external dependencies before imports
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
const { handler } = require('../../../../lib/cmds/content-type_cmds/publish')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>

const publishedContentType = {
  sys: { id: 'blog-post', version: 4, publishedVersion: 3 },
  name: 'Blog Post',
  fields: [{ id: 'title', name: 'Title', type: 'Symbol', required: true }]
}

const existingContentType = {
  sys: { id: 'blog-post', version: 3 },
  name: 'Blog Post',
  fields: [{ id: 'title', name: 'Title', type: 'Symbol', required: true }]
}

const fakeClient = {
  contentType: {
    get: jest.fn().mockResolvedValue(existingContentType),
    publish: jest.fn().mockResolvedValue(publishedContentType)
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeClient.contentType.get.mockResolvedValue(existingContentType)
  fakeClient.contentType.publish.mockResolvedValue(publishedContentType)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  id: 'blog-post'
}

describe('content-type publish', () => {
  it('fetches the content type by id', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.get).toHaveBeenCalledWith({
      contentTypeId: 'blog-post'
    })
  })

  it('calls contentType.publish() with the fetched content type', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.publish).toHaveBeenCalledWith(
      { contentTypeId: 'blog-post' },
      existingContentType
    )
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'content_type-publish' }),
      expect.any(Object)
    )
  })

  it('passes publish result to output', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      publishedContentType,
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

  it('passes quietExtractor that returns content type id', async () => {
    await handler(baseArgv)
    const opts = mockOutput.mock.calls[0][2] as any
    expect(opts.quietExtractor).toBeDefined()
    expect(opts.quietExtractor(publishedContentType)).toEqual(['blog-post'])
  })

  it('exits with code 1 when contentType.get fails with 404', async () => {
    const err = Object.assign(new Error('Not Found'), {
      response: { status: 404 }
    })
    fakeClient.contentType.get.mockRejectedValueOnce(err)
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

  it('exits with code 2 when publish fails with 500', async () => {
    const err = Object.assign(new Error('Server Error'), {
      response: { status: 500 }
    })
    fakeClient.contentType.publish.mockRejectedValueOnce(err)
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((_code?: any) => {
        throw new Error(`process.exit(${_code})`)
      })
    try {
      await expect(handler(baseArgv)).rejects.toThrow('process.exit(2)')
    } finally {
      exitSpy.mockRestore()
    }
  })
})

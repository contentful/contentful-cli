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

import {output} from '../../../../lib/utils/output'
import {warning, logError} from '../../../../lib/utils/log'

const {createPlainClient} = require('../../../../lib/utils/contentful-clients')
const {confirmation} = require('../../../../lib/utils/actions')
const {handler} = require('../../../../lib/cmds/content-type_cmds/delete')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockWarning = warning as jest.MockedFunction<typeof warning>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>
const mockConfirmation = confirmation as jest.MockedFunction<any>

const mockContentType = {
  sys: {id: 'blog-post', version: 3},
  name: 'Blog Post'
}

const fakeClient = {
  contentType: {
    get: jest.fn().mockResolvedValue(mockContentType),
    unpublish: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined)
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  fakeClient.contentType.get.mockResolvedValue(mockContentType)
  fakeClient.contentType.unpublish.mockResolvedValue(undefined)
  fakeClient.contentType.delete.mockResolvedValue(undefined)
  mockConfirmation.mockResolvedValue(true)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  id: 'blog-post'
}

describe('content-type delete', () => {
  it('prompts for confirmation before deleting', async () => {
    await handler(baseArgv)
    expect(mockConfirmation).toHaveBeenCalledTimes(1)
  })

  it('fetches the content type by id', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.get).toHaveBeenCalledWith({contentTypeId: 'blog-post'})
  })

  it('calls contentType.delete() after confirmation', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.delete).toHaveBeenCalledWith({contentTypeId: 'blog-post'})
  })

  it('does not unpublish when content type is not published', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.unpublish).not.toHaveBeenCalled()
  })

  it('unpublishes before deleting when content type is published', async () => {
    fakeClient.contentType.get.mockResolvedValueOnce({
      sys: {id: 'blog-post', version: 3, publishedVersion: 2},
      name: 'Blog Post'
    })
    await handler(baseArgv)
    expect(fakeClient.contentType.unpublish).toHaveBeenCalledWith({contentTypeId: 'blog-post'})
    expect(fakeClient.contentType.delete).toHaveBeenCalledWith({contentTypeId: 'blog-post'})
  })

  it('skips confirmation when --yes is passed', async () => {
    await handler({...baseArgv, yes: true})
    expect(mockConfirmation).not.toHaveBeenCalled()
    expect(fakeClient.contentType.delete).toHaveBeenCalled()
  })

  it('aborts delete when confirmation is denied', async () => {
    mockConfirmation.mockResolvedValueOnce(false)
    await handler(baseArgv)
    expect(fakeClient.contentType.delete).not.toHaveBeenCalled()
    expect(mockWarning).toHaveBeenCalled()
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'content_type-delete'}),
      expect.any(Object)
    )
  })

  it('passes result to output with deleted flag and id', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      {deleted: true, id: 'blog-post'},
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('passes quietExtractor that returns the deleted id', async () => {
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    expect(opts.quietExtractor).toBeDefined()
    expect(opts.quietExtractor({deleted: true, id: 'blog-post'})).toEqual(['blog-post'])
  })

  it('exits with code 1 when get fails with 404', async () => {
    const err = Object.assign(new Error('Not Found'), {response: {status: 404}})
    fakeClient.contentType.get.mockRejectedValueOnce(err)
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
    try {
      await expect(handler(baseArgv)).rejects.toThrow('process.exit(1)')
      expect(mockLogError).toHaveBeenCalledWith(err)
    } finally {
      exitSpy.mockRestore()
    }
  })

  it('passes --json flag to output', async () => {
    await handler({...baseArgv, json: true})
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({json: true}),
      expect.any(Object)
    )
  })
})

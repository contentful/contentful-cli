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
import {logError} from '../../../../lib/utils/log'

const {createPlainClient} = require('../../../../lib/utils/contentful-clients')
const {handler} = require('../../../../lib/cmds/content-type_cmds/update')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>

const updatedContentType = {
  sys: {id: 'blog-post', version: 4, publishedVersion: 3},
  name: 'Blog Post Updated',
  description: 'Updated description',
  displayField: 'title',
  fields: [{id: 'title', name: 'Title', type: 'Symbol', required: true}]
}

const existingContentType = {
  sys: {id: 'blog-post', version: 3, publishedVersion: 2},
  name: 'Blog Post',
  description: 'Old description',
  displayField: 'title',
  fields: [{id: 'title', name: 'Title', type: 'Symbol', required: true}]
}

const fakeClient = {
  contentType: {
    get: jest.fn(),
    update: jest.fn().mockResolvedValue(updatedContentType)
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  // Return a fresh copy each time to avoid cross-test mutation issues
  fakeClient.contentType.get.mockResolvedValue({...existingContentType, sys: {...existingContentType.sys}})
  fakeClient.contentType.update.mockResolvedValue(updatedContentType)
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  id: 'blog-post',
  version: 3
}

describe('content-type update', () => {
  it('fetches the content type by id first', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.get).toHaveBeenCalledWith({contentTypeId: 'blog-post'})
  })

  it('calls contentType.update() on the fetched content type', async () => {
    await handler(baseArgv)
    expect(fakeClient.contentType.update).toHaveBeenCalledWith(
      {contentTypeId: 'blog-post'},
      expect.any(Object)
    )
  })

  it('rejects when provided version does not match content type version', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any)
    await handler({...baseArgv, version: 5})
    expect(exitSpy).toHaveBeenCalledWith(1)
    exitSpy.mockRestore()
  })

  it('proceeds when version matches content type version', async () => {
    await handler({...baseArgv, version: 3})
    expect(fakeClient.contentType.update).toHaveBeenCalled()
  })

  it('updates name when --name is provided', async () => {
    const ct = {...existingContentType, sys: {...existingContentType.sys}}
    fakeClient.contentType.get.mockResolvedValueOnce(ct)
    await handler({...baseArgv, name: 'New Name'})
    expect(ct.name).toBe('New Name')
  })

  it('updates description when --description is provided', async () => {
    const ct = {...existingContentType, sys: {...existingContentType.sys}}
    fakeClient.contentType.get.mockResolvedValueOnce(ct)
    await handler({...baseArgv, description: 'New Desc'})
    expect(ct.description).toBe('New Desc')
  })

  it('updates displayField when --display-field is provided', async () => {
    const ct = {...existingContentType, sys: {...existingContentType.sys}}
    fakeClient.contentType.get.mockResolvedValueOnce(ct)
    await handler({...baseArgv, displayField: 'body'})
    expect(ct.displayField).toBe('body')
  })

  it('updates fields when --fields is provided', async () => {
    const ct = {...existingContentType, sys: {...existingContentType.sys}}
    fakeClient.contentType.get.mockResolvedValueOnce(ct)
    const newFields = '[{"id":"body","name":"Body","type":"Text","required":false}]'
    await handler({...baseArgv, fields: newFields})
    expect(ct.fields).toEqual([{id: 'body', name: 'Body', type: 'Text', required: false}])
  })

  it('does not modify fields when --fields is not provided', async () => {
    const ct = {...existingContentType, sys: {...existingContentType.sys}}
    fakeClient.contentType.get.mockResolvedValueOnce(ct)
    await handler(baseArgv)
    expect(ct.fields).toEqual(existingContentType.fields)
  })

  it('creates plain client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'content_type-update'}),
      expect.any(Object)
    )
  })

  it('passes update result to output', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      updatedContentType,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('throws when --fields contains invalid JSON', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
    try {
      await expect(
        handler({...baseArgv, fields: 'bad-json'})
      ).rejects.toThrow('process.exit')
    } finally {
      exitSpy.mockRestore()
    }
  })

  it('passes quietExtractor that returns content type id', async () => {
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    expect(opts.quietExtractor).toBeDefined()
    expect(opts.quietExtractor(updatedContentType)).toEqual(['blog-post'])
  })

  it('exits with code 2 on server error', async () => {
    const err = Object.assign(new Error('Server Error'), {response: {status: 500}})
    fakeClient.contentType.get.mockRejectedValueOnce(err)
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
    try {
      await expect(handler(baseArgv)).rejects.toThrow('process.exit(2)')
    } finally {
      exitSpy.mockRestore()
    }
  })
})

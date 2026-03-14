// Mock all external dependencies before imports
jest.mock('../../../../lib/utils/contentful-clients', () => ({
  createManagementClient: jest.fn()
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

const {createManagementClient} = require('../../../../lib/utils/contentful-clients')
const {handler} = require('../../../../lib/cmds/content-type_cmds/get')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>

const mockContentType = {
  sys: {id: 'blog-post', version: 3, publishedVersion: 2},
  name: 'Blog Post',
  description: 'A blog post content type',
  displayField: 'title',
  fields: [{id: 'title', name: 'Title', type: 'Symbol', required: true}]
}

const mockGetContentType = jest.fn().mockResolvedValue(mockContentType)
const fakeEnvironment = {getContentType: mockGetContentType}
const fakeSpace = {getEnvironment: jest.fn().mockResolvedValue(fakeEnvironment)}

beforeEach(() => {
  jest.clearAllMocks()
  fakeSpace.getEnvironment.mockResolvedValue(fakeEnvironment)
  mockGetContentType.mockResolvedValue(mockContentType)
  mockCreateManagementClient.mockResolvedValue({
    getSpace: jest.fn().mockResolvedValue(fakeSpace)
  })
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  id: 'blog-post'
}

describe('content-type get', () => {
  it('calls getContentType with the provided id', async () => {
    await handler(baseArgv)
    expect(mockGetContentType).toHaveBeenCalledWith('blog-post')
  })

  it('creates management client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'token-abc',
        feature: 'content_type-get'
      })
    )
  })

  it('passes result to output', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      mockContentType,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('passes --json flag to output', async () => {
    await handler({...baseArgv, json: true})
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({json: true}),
      expect.any(Object)
    )
  })

  it('passes --quiet flag to output', async () => {
    await handler({...baseArgv, quiet: true})
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({quiet: true}),
      expect.any(Object)
    )
  })

  it('passes quietExtractor that returns content type id', async () => {
    await handler(baseArgv)
    const outputCall = mockOutput.mock.calls[0]
    const opts = outputCall[2] as any
    expect(opts.quietExtractor).toBeDefined()
    expect(opts.quietExtractor(mockContentType)).toEqual(['blog-post'])
  })

  it('logs error and exits on failure', async () => {
    const err = Object.assign(new Error('Not Found'), {response: {status: 404}})
    mockGetContentType.mockRejectedValueOnce(err)
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
})

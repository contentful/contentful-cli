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
import {warning, logError} from '../../../../lib/utils/log'

const {createManagementClient} = require('../../../../lib/utils/contentful-clients')
const {confirmation} = require('../../../../lib/utils/actions')
const {handler} = require('../../../../lib/cmds/content-type_cmds/delete')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockWarning = warning as jest.MockedFunction<typeof warning>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>
const mockConfirmation = confirmation as jest.MockedFunction<any>

const mockDelete = jest.fn().mockResolvedValue(undefined)
const mockGetContentType = jest.fn().mockResolvedValue({
  sys: {id: 'blog-post', version: 3},
  name: 'Blog Post',
  delete: mockDelete
})

const fakeEnvironment = {getContentType: mockGetContentType}
const fakeSpace = {getEnvironment: jest.fn().mockResolvedValue(fakeEnvironment)}

beforeEach(() => {
  jest.clearAllMocks()
  fakeSpace.getEnvironment.mockResolvedValue(fakeEnvironment)
  mockDelete.mockResolvedValue(undefined)
  mockGetContentType.mockResolvedValue({
    sys: {id: 'blog-post', version: 3},
    name: 'Blog Post',
    delete: mockDelete
  })
  mockConfirmation.mockResolvedValue(true)
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

describe('content-type delete', () => {
  it('prompts for confirmation before deleting', async () => {
    await handler(baseArgv)
    expect(mockConfirmation).toHaveBeenCalledTimes(1)
  })

  it('fetches the content type by id', async () => {
    await handler(baseArgv)
    expect(mockGetContentType).toHaveBeenCalledWith('blog-post')
  })

  it('calls delete() on the content type after confirmation', async () => {
    await handler(baseArgv)
    expect(mockDelete).toHaveBeenCalled()
  })

  it('skips confirmation when --yes is passed', async () => {
    await handler({...baseArgv, yes: true})
    expect(mockConfirmation).not.toHaveBeenCalled()
    expect(mockDelete).toHaveBeenCalled()
  })

  it('aborts delete when confirmation is denied', async () => {
    mockConfirmation.mockResolvedValueOnce(false)
    await handler(baseArgv)
    expect(mockDelete).not.toHaveBeenCalled()
    expect(mockWarning).toHaveBeenCalled()
  })

  it('creates management client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({feature: 'content_type-delete'})
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

  it('exits with code 1 when delete fails with 404', async () => {
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

  it('passes --json flag to output', async () => {
    await handler({...baseArgv, json: true})
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({json: true}),
      expect.any(Object)
    )
  })
})

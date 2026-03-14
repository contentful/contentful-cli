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
const {handler} = require('../../../../lib/cmds/content-type_cmds/create')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockWarning = warning as jest.MockedFunction<typeof warning>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreateManagementClient = createManagementClient as jest.MockedFunction<any>

const createdContentType = {
  sys: {id: 'blog-post', version: 1},
  name: 'Blog Post',
  fields: [{id: 'title', name: 'Title', type: 'Symbol', required: true}]
}

const mockCreateContentType = jest.fn().mockResolvedValue(createdContentType)
const mockCreateContentTypeWithId = jest.fn().mockResolvedValue({
  ...createdContentType,
  sys: {id: 'custom-id', version: 1}
})
const fakeEnvironment = {
  createContentType: mockCreateContentType,
  createContentTypeWithId: mockCreateContentTypeWithId
}
const fakeSpace = {getEnvironment: jest.fn().mockResolvedValue(fakeEnvironment)}

beforeEach(() => {
  jest.clearAllMocks()
  fakeSpace.getEnvironment.mockResolvedValue(fakeEnvironment)
  mockCreateManagementClient.mockResolvedValue({
    getSpace: jest.fn().mockResolvedValue(fakeSpace)
  })
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  name: 'Blog Post',
  fields: '[{"id":"title","name":"Title","type":"Symbol","required":true}]'
}

describe('content-type create', () => {
  it('calls createContentType with name and parsed fields', async () => {
    await handler(baseArgv)
    expect(mockCreateContentType).toHaveBeenCalledWith({
      name: 'Blog Post',
      fields: [{id: 'title', name: 'Title', type: 'Symbol', required: true}]
    })
  })

  it('calls createContentTypeWithId when --id is provided', async () => {
    await handler({...baseArgv, id: 'custom-id'})
    expect(mockCreateContentTypeWithId).toHaveBeenCalledWith('custom-id', {
      name: 'Blog Post',
      fields: [{id: 'title', name: 'Title', type: 'Symbol', required: true}]
    })
    expect(mockCreateContentType).not.toHaveBeenCalled()
  })

  it('includes description when provided', async () => {
    await handler({...baseArgv, description: 'A blog post'})
    expect(mockCreateContentType).toHaveBeenCalledWith(
      expect.objectContaining({description: 'A blog post'})
    )
  })

  it('includes displayField when provided', async () => {
    await handler({...baseArgv, displayField: 'title'})
    expect(mockCreateContentType).toHaveBeenCalledWith(
      expect.objectContaining({displayField: 'title'})
    )
  })

  it('creates management client with correct feature', async () => {
    await handler(baseArgv)
    expect(mockCreateManagementClient).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: 'content_type-create'
      })
    )
  })

  it('passes result to output', async () => {
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      createdContentType,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('performs dry run when --dry-run is set', async () => {
    await handler({...baseArgv, dryRun: true})
    expect(mockCreateContentType).not.toHaveBeenCalled()
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('[DRY RUN]'))
    expect(mockOutput).toHaveBeenCalledWith(
      expect.objectContaining({dryRun: true, action: 'create', name: 'Blog Post'}),
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('dry run uses auto-generated id placeholder when no id provided', async () => {
    await handler({...baseArgv, dryRun: true})
    const outputData = (mockOutput.mock.calls[0][0] as any)
    expect(outputData.id).toBe('(auto-generated)')
  })

  it('dry run uses custom id when --id is provided', async () => {
    await handler({...baseArgv, dryRun: true, id: 'my-id'})
    const outputData = (mockOutput.mock.calls[0][0] as any)
    expect(outputData.id).toBe('my-id')
  })

  it('throws when --fields is not valid JSON', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
    try {
      await expect(
        handler({...baseArgv, fields: 'not-json'})
      ).rejects.toThrow('process.exit')
    } finally {
      exitSpy.mockRestore()
    }
  })

  it('throws when --fields is a JSON object instead of array', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
    try {
      await expect(
        handler({...baseArgv, fields: '{"id":"title"}'})
      ).rejects.toThrow('process.exit')
    } finally {
      exitSpy.mockRestore()
    }
  })

  it('passes quietExtractor that returns content type id', async () => {
    await handler(baseArgv)
    const opts = (mockOutput.mock.calls[0][2] as any)
    expect(opts.quietExtractor).toBeDefined()
    expect(opts.quietExtractor(createdContentType)).toEqual(['blog-post'])
  })

  it('exits with code 1 when creation fails with 4xx', async () => {
    const err = Object.assign(new Error('Unprocessable'), {response: {status: 422}})
    mockCreateContentType.mockRejectedValueOnce(err)
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
    try {
      await expect(handler(baseArgv)).rejects.toThrow('process.exit(1)')
    } finally {
      exitSpy.mockRestore()
    }
  })
})

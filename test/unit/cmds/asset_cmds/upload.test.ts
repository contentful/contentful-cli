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
  output: jest.fn(),
  firstLocaleValue: jest.requireActual('../../../../lib/utils/output').firstLocaleValue
}))
jest.mock('../../../../lib/utils/log', () => ({
  log: jest.fn(),
  warning: jest.fn(),
  logError: jest.fn()
}))
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn()
}))
jest.mock('path', () => {
  const actual = jest.requireActual('path')
  return {
    ...actual,
    basename: jest.fn((p: string) => actual.basename(p)),
    extname: jest.fn((p: string) => actual.extname(p))
  }
})

import {handler} from '../../../../lib/cmds/asset_cmds/upload'
import {output} from '../../../../lib/utils/output'

const {createPlainClient} = require('../../../../lib/utils/contentful-clients')
const fs = require('fs')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>
const mockExistsSync = fs.existsSync as jest.MockedFunction<any>
const mockCreateReadStream = fs.createReadStream as jest.MockedFunction<any>

const mockStream = {pipe: jest.fn()}

const mockUpload = {
  sys: {id: 'upload-123'}
}

const mockProcessedAsset = {
  sys: {id: 'asset-xyz', version: 2},
  fields: {
    title: {'en-US': 'My Image'},
    file: {
      'en-US': {
        fileName: 'photo.png',
        contentType: 'image/png',
        url: '//images.ctfassets.net/photo.png'
      }
    }
  }
}

function makeFakeClient(overrides: Record<string, any> = {}) {
  return {
    upload: {
      create: jest.fn().mockResolvedValue(mockUpload)
    },
    asset: {
      create: jest.fn().mockResolvedValue({
        sys: {id: 'asset-xyz'}
      }),
      createWithId: jest.fn().mockResolvedValue({
        sys: {id: 'custom-id'}
      }),
      processForAllLocales: jest.fn().mockResolvedValue({
        sys: {id: 'asset-xyz', version: 2},
        fields: {
          title: {'en-US': 'My Image'},
          file: {
            'en-US': {
              fileName: 'photo.png',
              contentType: 'image/png'
              // no url yet — get will return the url
            }
          }
        }
      }),
      get: jest.fn().mockResolvedValue(mockProcessedAsset)
    },
    ...overrides
  }
}

let fakeClient: ReturnType<typeof makeFakeClient>

let exitSpy: jest.SpyInstance

beforeEach(() => {
  jest.clearAllMocks()
  exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any)
  mockExistsSync.mockReturnValue(true)
  mockCreateReadStream.mockReturnValue(mockStream)
  fakeClient = makeFakeClient()
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

afterEach(() => {
  exitSpy.mockRestore()
})

const baseArgv = {
  spaceId: 'my-space',
  environmentId: 'master',
  managementToken: 'token-abc',
  file: '/tmp/photo.png',
  title: 'My Image',
  locale: 'en-US'
}

describe('asset upload — handler', () => {
  it('creates plain client with asset-upload feature', async () => {
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'token-abc',
        feature: 'asset-upload'
      }),
      expect.any(Object)
    )
  })

  it('creates upload, creates asset, processes, and polls successfully', async () => {
    await handler(baseArgv)

    expect(fakeClient.upload.create).toHaveBeenCalledWith({}, {
      file: mockStream
    })
    expect(fakeClient.asset.create).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        fields: expect.objectContaining({
          title: {'en-US': 'My Image'},
          file: {
            'en-US': expect.objectContaining({
              contentType: 'image/png',
              fileName: 'photo.png',
              uploadFrom: {
                sys: {type: 'Link', linkType: 'Upload', id: 'upload-123'}
              }
            })
          }
        })
      })
    )
    expect(fakeClient.asset.get).toHaveBeenCalledWith({assetId: 'asset-xyz'})
    expect(mockOutput).toHaveBeenCalledWith(
      mockProcessedAsset,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('uses asset.createWithId when --id is provided', async () => {
    fakeClient.asset.processForAllLocales.mockResolvedValue({
      sys: {id: 'custom-id', version: 2},
      fields: {
        title: {'en-US': 'My Image'},
        file: {'en-US': {fileName: 'photo.png', contentType: 'image/png'}}
      }
    })
    fakeClient.asset.get.mockResolvedValue({
      ...mockProcessedAsset,
      sys: {id: 'custom-id', version: 2}
    })

    await handler({...baseArgv, id: 'custom-id'})

    expect(fakeClient.asset.createWithId).toHaveBeenCalledWith(
      {assetId: 'custom-id'},
      expect.any(Object)
    )
    expect(fakeClient.asset.create).not.toHaveBeenCalled()
  })

  it('includes description field when --description is provided', async () => {
    await handler({...baseArgv, description: 'A great photo'})

    expect(fakeClient.asset.create).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        fields: expect.objectContaining({
          description: {'en-US': 'A great photo'}
        })
      })
    )
  })

  it('omits description field when --description is not provided', async () => {
    await handler(baseArgv)

    const call = fakeClient.asset.create.mock.calls[0][1]
    expect(call.fields.description).toBeUndefined()
  })

  describe('MIME type auto-detection', () => {
    it('detects image/png for .png files', async () => {
      await handler({...baseArgv, file: '/tmp/photo.png'})
      const call = fakeClient.asset.create.mock.calls[0][1]
      expect(call.fields.file['en-US'].contentType).toBe('image/png')
    })

    it('detects application/pdf for .pdf files', async () => {
      fakeClient.asset.get.mockResolvedValue({
        ...mockProcessedAsset,
        fields: {
          ...mockProcessedAsset.fields,
          file: {'en-US': {fileName: 'doc.pdf', url: '//cdn.example.com/doc.pdf'}}
        }
      })
      await handler({...baseArgv, file: '/tmp/doc.pdf', title: 'Doc'})
      const call = fakeClient.asset.create.mock.calls[0][1]
      expect(call.fields.file['en-US'].contentType).toBe('application/pdf')
    })

    it('detects application/octet-stream for unknown extensions', async () => {
      fakeClient.asset.get.mockResolvedValue({
        ...mockProcessedAsset,
        fields: {
          ...mockProcessedAsset.fields,
          file: {'en-US': {fileName: 'data.xyz', url: '//cdn.example.com/data.xyz'}}
        }
      })
      await handler({...baseArgv, file: '/tmp/data.xyz', title: 'Data'})
      const call = fakeClient.asset.create.mock.calls[0][1]
      expect(call.fields.file['en-US'].contentType).toBe('application/octet-stream')
    })

    it('uses --content-type override when provided', async () => {
      await handler({
        ...baseArgv,
        file: '/tmp/photo.png',
        contentType: 'image/webp'
      })
      const call = fakeClient.asset.create.mock.calls[0][1]
      expect(call.fields.file['en-US'].contentType).toBe('image/webp')
    })
  })

  it('throws error when file not found', async () => {
    mockExistsSync.mockReturnValue(false)
    await handler({...baseArgv, file: '/tmp/nonexistent.png'})
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('validates asset ID when --id is provided and rejects invalid IDs', async () => {
    await handler({...baseArgv, id: 'invalid id!'})
    expect(exitSpy).toHaveBeenCalledWith(1)
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

  it('quietExtractor returns [asset.sys.id]', async () => {
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(typeof opts.quietExtractor).toBe('function')
    const ids = opts.quietExtractor(mockProcessedAsset)
    expect(ids).toEqual(['asset-xyz'])
  })

  it('tableFormat includes correct key-value rows', async () => {
    await handler(baseArgv)
    const call = mockOutput.mock.calls[0]
    const opts = call[2] as any
    expect(opts.keyValue).toBeDefined()
    const rows = opts.keyValue.rows
    expect(rows).toContainEqual(['ID', 'asset-xyz'])
    expect(rows).toContainEqual(['Title', 'My Image'])
    expect(rows).toContainEqual(['File', 'photo.png'])
    expect(rows).toContainEqual(['URL', '//images.ctfassets.net/photo.png'])
  })

  describe('polling for processing completion', () => {
    it('polls until asset has a URL and returns it', async () => {
      // First call returns no URL, second call returns URL
      fakeClient.asset.get
        .mockResolvedValueOnce({
          sys: {id: 'asset-xyz'},
          fields: {
            file: {'en-US': {fileName: 'photo.png'}}
          }
        })
        .mockResolvedValueOnce(mockProcessedAsset)

      await handler(baseArgv)

      expect(fakeClient.asset.get).toHaveBeenCalledTimes(2)
      expect(mockOutput).toHaveBeenCalledWith(
        mockProcessedAsset,
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('throws timeout error when asset processing never completes', async () => {
      // Always return asset without URL
      fakeClient.asset.get.mockResolvedValue({
        sys: {id: 'asset-xyz'},
        fields: {
          file: {'en-US': {fileName: 'photo.png'}}
        }
      })

      await handler(baseArgv)
      expect(exitSpy).toHaveBeenCalledWith(1)
    }, 60000)
  })

  describe('--dry-run', () => {
    it('validates file exists and shows payload without uploading', async () => {
      await handler({...baseArgv, dryRun: true})

      expect(fakeClient.upload.create).not.toHaveBeenCalled()
      expect(fakeClient.asset.create).not.toHaveBeenCalled()

      const call = mockOutput.mock.calls[0]
      const data = call[0]
      expect(data.dryRun).toBe(true)
      expect(data.action).toBe('upload')
      expect(data.file).toBe('/tmp/photo.png')
      expect(data.fileName).toBe('photo.png')
      expect(data.title).toBe('My Image')
      expect(data.assetId).toBe('(auto-generated)')
    })

    it('dry-run throws error when file not found', async () => {
      mockExistsSync.mockReturnValue(false)
      await handler({...baseArgv, dryRun: true, file: '/tmp/missing.png'})
      expect(exitSpy).toHaveBeenCalledWith(1)
    })

    it('dry-run shows provided asset ID when --id given', async () => {
      await handler({...baseArgv, dryRun: true, id: 'my-asset-id'})
      const call = mockOutput.mock.calls[0]
      const data = call[0]
      expect(data.assetId).toBe('my-asset-id')
    })

    it('dry-run includes description when provided', async () => {
      await handler({...baseArgv, dryRun: true, description: 'A photo'})
      const call = mockOutput.mock.calls[0]
      const data = call[0]
      expect(data.description).toBe('A photo')
    })

    it('dry-run auto-detects content type', async () => {
      await handler({...baseArgv, dryRun: true, file: '/tmp/doc.pdf'})
      const call = mockOutput.mock.calls[0]
      const data = call[0]
      expect(data.contentType).toBe('application/pdf')
    })
  })
})

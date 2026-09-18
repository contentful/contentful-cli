import {
  MAX_ENTITIES_PER_BULK_ACTION,
  MAX_ENTRIES_PER_BULK_JOB,
  BulkOperationEntityResult,
  chunk,
  createCmaBulkTransport,
  importEntriesWithBulkOperations,
  isPublishedInExport,
  partitionEntries,
  prepareEntryForCreate,
  prepareEntryForUpdate
} from '../../../lib/utils/bulk-entry-import'

const sourceEntry = (
  id: string,
  extras: { publishedVersion?: number; title?: string } = {}
) => ({
  sys: {
    id,
    type: 'Entry',
    version: 12,
    publishedVersion: extras.publishedVersion,
    space: { sys: { type: 'Link', linkType: 'Space', id: 'src' } },
    contentType: {
      sys: { type: 'Link', linkType: 'ContentType', id: 'blogPost' }
    }
  },
  fields: { title: { 'en-US': extras.title || id } },
  metadata: { tags: [] }
})

describe('chunk / prepare / partition', () => {
  test('chunks items and rejects a non-positive size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(() => chunk([1], 0)).toThrow('Chunk size must be greater than 0')
  })

  test('prepares create payloads without destination sys metadata', () => {
    const prepared = prepareEntryForCreate(sourceEntry('a'))
    expect(prepared.sys).toEqual({
      type: 'Entry',
      id: 'a',
      contentType: {
        sys: { type: 'Link', linkType: 'ContentType', id: 'blogPost' }
      }
    })
    expect(prepared.fields).toEqual({ title: { 'en-US': 'a' } })
    expect(prepared.metadata).toEqual({ tags: [] })
  })

  test('prepares update payloads with the destination version', () => {
    expect(prepareEntryForUpdate(sourceEntry('a'), 3).sys?.version).toBe(3)
  })

  test('prepares minimal entries with empty fields', () => {
    expect(prepareEntryForCreate({ sys: { id: 'minimal' } })).toEqual({
      sys: { type: 'Entry', id: 'minimal' },
      fields: {}
    })
    expect(prepareEntryForCreate({})).toEqual({
      sys: { type: 'Entry' },
      fields: {}
    })
  })

  test('treats publishedVersion as the export publish signal', () => {
    expect(isPublishedInExport(sourceEntry('draft'))).toBe(false)
    expect(
      isPublishedInExport(sourceEntry('live', { publishedVersion: 11 }))
    ).toBe(true)
  })

  test('splits create vs update and honors skipContentUpdates', () => {
    const destination = new Map([
      ['existing', 4],
      ['skip-me', 1]
    ])
    const { toCreate, toUpdate } = partitionEntries(
      [sourceEntry('existing'), sourceEntry('fresh'), sourceEntry('skip-me')],
      destination
    )
    expect(toCreate.map(entry => entry.sys?.id)).toEqual(['fresh'])
    expect(toUpdate.map(entry => entry.sys?.id)).toEqual([
      'existing',
      'skip-me'
    ])
    expect(toUpdate[0].sys?.version).toBe(4)

    const skipped = partitionEntries(
      [sourceEntry('existing'), sourceEntry('fresh')],
      destination,
      true
    )
    expect(skipped.toCreate.map(entry => entry.sys?.id)).toEqual(['fresh'])
    expect(skipped.toUpdate).toEqual([])
  })

  test('rejects entries without IDs', () => {
    expect(() => partitionEntries([{ fields: {} }], new Map())).toThrow(
      'Entry at index 0 does not include sys.id'
    )
  })
})

function createTransport(overrides: Record<string, jest.Mock> = {}) {
  const operations = new Map<
    string,
    {
      sys: { id: string; status: string }
      result: { items: BulkOperationEntityResult[] }
    }
  >()
  let opCount = 0

  const transport = {
    listEntryVersions: jest.fn().mockResolvedValue(new Map()),
    uploadEntries: jest.fn().mockImplementation(async (entries: unknown[]) => {
      return `upload-${entries.length}`
    }),
    createBulkOperation: jest
      .fn()
      .mockImplementation(async (action: string) => {
        opCount += 1
        const id = `${action}-${opCount}`
        operations.set(id, {
          sys: { id, status: 'in_progress' },
          result: { items: [] }
        })
        return { sys: { id, status: 'in_progress' } }
      }),
    getBulkOperation: jest.fn().mockImplementation(async (id: string) => {
      const current = operations.get(id)
      current.sys.status = 'completed'
      return current
    }),
    publishEntries: jest.fn().mockResolvedValue(undefined),
    ...overrides
  }

  return { transport, operations }
}

describe('importEntriesWithBulkOperations', () => {
  test('creates, updates and publishes in bulk batches', async () => {
    const created = Array.from(
      { length: MAX_ENTRIES_PER_BULK_JOB + 1 },
      (_, i) => sourceEntry(`new-${i}`, { publishedVersion: 1 })
    )
    const updated = [sourceEntry('existing', { publishedVersion: 5 })]
    const draft = [sourceEntry('draft-only')]
    const { transport, operations } = createTransport()

    transport.listEntryVersions.mockResolvedValue(new Map([['existing', 2]]))
    transport.createBulkOperation.mockImplementation(async (action: string) => {
      const id = `${action}-${operations.size + 1}`
      operations.set(id, {
        sys: { id, status: 'in_progress' },
        result: { items: [] }
      })
      return { sys: { id, status: 'in_progress' } }
    })
    transport.getBulkOperation.mockImplementation(async (id: string) => {
      const current = operations.get(id)
      current.sys.status = 'completed'
      if (id.startsWith('create')) {
        current.result.items = created.map(entry => ({
          status: 'succeeded',
          entity: { sys: { id: entry.sys.id, version: 1 } }
        }))
        current.result.items[0].entity.sys.version = 1
        current.result.items[created.length - 1] = {
          status: 'succeeded',
          entity: {
            sys: { id: created[created.length - 1].sys.id, version: 1 }
          }
        }
      }
      if (id.startsWith('update')) {
        current.result.items = [
          {
            status: 'succeeded',
            entity: { sys: { id: 'existing' } }
          }
        ]
      }
      return current
    })

    const result = await importEntriesWithBulkOperations({
      entries: [...created, ...updated, ...draft],
      transport,
      sleep: async () => undefined,
      pollIntervalMs: 0,
      logger: { log: jest.fn(), warning: jest.fn() }
    })

    expect(transport.uploadEntries).toHaveBeenCalledTimes(3)
    expect(transport.uploadEntries.mock.calls[0][0]).toHaveLength(
      MAX_ENTRIES_PER_BULK_JOB
    )
    expect(transport.uploadEntries.mock.calls[1][0]).toHaveLength(2)
    expect(
      transport.createBulkOperation.mock.calls.map(call => call[0])
    ).toEqual(['create', 'create', 'update'])
    expect(result).toEqual({
      created: created.length + draft.length,
      updated: 1,
      published: created.length + 1,
      failures: []
    })
    expect(transport.publishEntries.mock.calls.length).toBe(
      Math.ceil((created.length + 1) / MAX_ENTITIES_PER_BULK_ACTION)
    )
    expect(transport.publishEntries.mock.calls[0][0]).toHaveLength(
      MAX_ENTITIES_PER_BULK_ACTION
    )
    expect(
      transport.publishEntries.mock.calls.flatMap(call => call[0])
    ).toContainEqual({ id: 'existing', version: 3 })
  })

  test('skips publishing and updates when those flags are set', async () => {
    const { transport } = createTransport()
    transport.listEntryVersions.mockResolvedValue(new Map([['existing', 1]]))
    transport.getBulkOperation.mockResolvedValue({
      sys: { id: 'create-1', status: 'completed' },
      result: {
        items: [
          { status: 'succeeded', entity: { sys: { id: 'fresh', version: 1 } } }
        ]
      }
    })

    const result = await importEntriesWithBulkOperations({
      entries: [
        sourceEntry('fresh', { publishedVersion: 1 }),
        sourceEntry('existing', { publishedVersion: 1 })
      ],
      transport,
      skipContentPublishing: true,
      skipContentUpdates: true,
      sleep: async () => undefined,
      logger: { log: jest.fn(), warning: jest.fn() }
    })

    expect(transport.createBulkOperation).toHaveBeenCalledWith(
      'create',
      expect.any(String)
    )
    expect(transport.createBulkOperation).not.toHaveBeenCalledWith(
      'update',
      expect.any(String)
    )
    expect(transport.publishEntries).not.toHaveBeenCalled()
    expect(result).toEqual({
      created: 1,
      updated: 0,
      published: 0,
      failures: []
    })
  })

  test('throws after logging per-item failures', async () => {
    const warnings: string[] = []
    const { transport } = createTransport()
    transport.getBulkOperation.mockResolvedValue({
      sys: { id: 'create-1', status: 'completed' },
      result: {
        items: [
          {
            status: 'failed',
            error: { message: 'Validation error' }
          }
        ]
      }
    })

    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('bad')],
        transport,
        sleep: async () => undefined,
        logger: { log: jest.fn(), warning: msg => warnings.push(String(msg)) }
      })
    ).rejects.toMatchObject({
      name: 'BulkEntryImportError',
      failures: ['bad: Validation error']
    })
    expect(warnings[0]).toContain('bad: Validation error')
  })

  test('times out when a job never completes', async () => {
    const { transport } = createTransport()
    transport.getBulkOperation.mockResolvedValue({
      sys: { id: 'create-1', status: 'in_progress' }
    })

    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('slow')],
        transport,
        sleep: async () => undefined,
        pollIntervalMs: 1,
        pollTimeoutMs: 5,
        logger: { log: jest.fn(), warning: jest.fn() }
      })
    ).rejects.toThrow(/Timed out waiting for bulk create/)
  })

  test.each(['failed', 'cancelled', 'canceled'])(
    'rejects a bulk job with %s status',
    async status => {
      const { transport } = createTransport()
      transport.createBulkOperation.mockResolvedValue({
        sys: { id: 'create-1', status }
      })

      await expect(
        importEntriesWithBulkOperations({
          entries: [sourceEntry('bad-job')],
          transport,
          sleep: async () => undefined,
          logger: { log: jest.fn(), warning: jest.fn() }
        })
      ).rejects.toThrow(`Bulk create operation create-1 ${status}`)
    }
  )

  test('rejects a bulk job response without an id', async () => {
    const { transport } = createTransport()
    transport.createBulkOperation.mockResolvedValue({
      sys: { status: 'in_progress' }
    })

    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('missing-operation-id')],
        transport,
        logger: { log: jest.fn(), warning: jest.fn() }
      })
    ).rejects.toThrow('operation response did not include an id')
  })

  test('uses error codes and fallback messages for unidentified failures', async () => {
    const warnings: string[] = []
    const { transport } = createTransport()
    transport.getBulkOperation.mockResolvedValue({
      sys: { id: 'create-1', status: 'completed' },
      result: {
        items: [
          { status: 'failed', error: { sys: { id: 'InvalidEntry' } } },
          { status: 'failed' }
        ]
      }
    })

    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('coded')],
        transport,
        sleep: async () => undefined,
        logger: {
          log: jest.fn(),
          warning: value => warnings.push(String(value))
        }
      })
    ).rejects.toMatchObject({
      failures: ['coded: InvalidEntry', 'unknown error']
    })
    expect(warnings).toHaveLength(2)
  })

  test('handles missing results and unidentified successful result items', async () => {
    const { transport } = createTransport()
    transport.getBulkOperation
      .mockResolvedValueOnce({ sys: { id: 'create-1', status: 'completed' } })
      .mockResolvedValueOnce({
        sys: { id: 'create-1', status: 'completed' },
        result: {
          items: [{ status: 'succeeded', entity: { sys: { id: 'known' } } }, {}]
        }
      })

    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('without-results')],
        transport,
        sleep: async () => undefined,
        logger: { log: jest.fn(), warning: jest.fn() }
      })
    ).resolves.toMatchObject({ created: 1 })

    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('submitted')],
        transport,
        sleep: async () => undefined,
        logger: { log: jest.fn(), warning: jest.fn() }
      })
    ).resolves.toMatchObject({ created: 1 })
  })

  test('polls an operation whose initial status is omitted', async () => {
    const { transport } = createTransport()
    transport.createBulkOperation.mockResolvedValue({ sys: { id: 'create-1' } })
    transport.getBulkOperation.mockResolvedValue({
      sys: { id: 'create-1', status: 'completed' }
    })

    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('no-initial-status')],
        transport,
        sleep: async () => undefined,
        logger: { log: jest.fn(), warning: jest.fn() }
      })
    ).resolves.toMatchObject({ created: 1 })
  })

  test('uses the default polling options and logger', async () => {
    const setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((callback: (...args: unknown[]) => void) => {
        callback()
        return 0 as unknown as NodeJS.Timeout
      })
    const { transport } = createTransport()
    await expect(
      importEntriesWithBulkOperations({
        entries: [sourceEntry('default-options')],
        transport
      })
    ).resolves.toMatchObject({ created: 1 })
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000)
    setTimeoutSpy.mockRestore()
  })

  test('does nothing when there are no entries', async () => {
    const { transport } = createTransport()
    const result = await importEntriesWithBulkOperations({
      entries: [],
      transport,
      logger: { log: jest.fn(), warning: jest.fn() }
    })
    expect(result.created).toBe(0)
    expect(transport.listEntryVersions).not.toHaveBeenCalled()
  })
})

describe('createCmaBulkTransport', () => {
  test('lists versions, uploads, starts jobs and publishes through the CMA client', async () => {
    const client = {
      entry: {
        getMany: jest.fn().mockResolvedValueOnce({
          items: [{ sys: { id: 'a', version: 2 } }],
          total: 1
        })
      },
      upload: {
        create: jest.fn().mockResolvedValue({ sys: { id: 'up1' } })
      },
      bulkAction: {
        publish: jest
          .fn()
          .mockResolvedValue({ sys: { id: 'ba1', status: 'succeeded' } }),
        get: jest.fn()
      },
      raw: {
        get: jest.fn(),
        post: jest.fn().mockResolvedValue({
          data: { sys: { id: 'op1', status: 'in_progress' } }
        })
      }
    }

    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(transport.listEntryVersions()).resolves.toEqual(
      new Map([['a', 2]])
    )
    await expect(transport.uploadEntries([{ sys: { id: 'a' } }])).resolves.toBe(
      'up1'
    )
    expect(client.upload.create).toHaveBeenCalledWith(
      { spaceId: 'space', environmentId: 'master' },
      { file: expect.any(ArrayBuffer) }
    )
    await expect(
      transport.createBulkOperation('create', 'up1')
    ).resolves.toEqual({
      sys: { id: 'op1', status: 'in_progress' }
    })
    expect(client.raw.post).toHaveBeenCalledWith(
      '/spaces/space/environments/master/bulk_operations/entries/create',
      {
        upload: {
          sys: { type: 'Upload', id: 'up1' }
        }
      }
    )

    await transport.publishEntries([{ id: 'a', version: 1 }], {
      sleep: async () => undefined,
      pollIntervalMs: 0,
      pollTimeoutMs: 100
    })
    expect(client.bulkAction.publish).toHaveBeenCalled()
  })

  test('maps a 403 from bulk operations to a Premium entitlement error', async () => {
    const client = {
      raw: {
        get: jest.fn(),
        post: jest.fn().mockRejectedValue({ response: { status: 403 } })
      }
    }

    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(
      transport.createBulkOperation('create', 'up1')
    ).rejects.toThrow(/Bulk Content Operations \(Premium\)/)
  })

  test('maps serialized SDK 403 errors to a Premium entitlement error', async () => {
    const client = {
      raw: {
        get: jest.fn(),
        post: jest.fn().mockRejectedValue(
          Object.assign(new Error(JSON.stringify({ status: 403 })), {
            name: 'Forbidden'
          })
        )
      }
    }

    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(
      transport.createBulkOperation('update', 'up1')
    ).rejects.toThrow(/Bulk Content Operations \(Premium\)/)
  })

  test.each([
    Object.assign(new Error('not json'), { name: '403 Forbidden' }),
    { status: 403 },
    { message: JSON.stringify({ status: 403 }) },
    { message: JSON.stringify({}), name: '403 Forbidden' }
  ])('recognizes supported 403 error shapes', async error => {
    const client = {
      raw: {
        get: jest.fn(),
        post: jest.fn().mockRejectedValue(error)
      }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(
      transport.createBulkOperation('create', 'up1')
    ).rejects.toThrow(/Bulk Content Operations \(Premium\)/)
  })

  test.each([null, 'network error', new Error('not json'), {}])(
    'preserves non-CMA errors',
    async error => {
      const client = {
        raw: {
          get: jest.fn(),
          post: jest.fn().mockRejectedValue(error)
        }
      }
      const transport = createCmaBulkTransport({
        client,
        spaceId: 'space',
        environmentId: 'master'
      })

      await expect(transport.createBulkOperation('create', 'up1')).rejects.toBe(
        error
      )
    }
  )

  test('paginates entry versions and ignores incomplete items', async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => ({
      sys: { id: `entry-${index}`, version: index + 1 }
    }))
    const client = {
      entry: {
        getMany: jest
          .fn()
          .mockResolvedValueOnce({ items: firstPage, total: 1002 })
          .mockResolvedValueOnce({
            items: [
              { sys: { id: 'last', version: 2 } },
              { sys: { id: 'no-version' } }
            ],
            total: 1002
          })
      },
      raw: { get: jest.fn(), post: jest.fn() }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    const versions = await transport.listEntryVersions()
    expect(client.entry.getMany).toHaveBeenCalledTimes(2)
    expect(versions.size).toBe(1001)
    expect(versions.get('last')).toBe(2)
  })

  test('lists entry versions through the raw fallback', async () => {
    const client = {
      entry: {},
      raw: {
        get: jest.fn().mockResolvedValue({
          data: { items: [{ sys: { id: 'raw', version: 4 } }] }
        }),
        post: jest.fn()
      }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(transport.listEntryVersions()).resolves.toEqual(
      new Map([['raw', 4]])
    )
  })

  test('handles an empty entry page without pagination metadata', async () => {
    const client = {
      entry: {
        getMany: jest.fn().mockResolvedValue({})
      },
      raw: { get: jest.fn(), post: jest.fn() }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(transport.listEntryVersions()).resolves.toEqual(new Map())
  })

  test('stops when an entry page omits items despite a larger total', async () => {
    const client = {
      entry: {
        getMany: jest.fn().mockResolvedValue({ total: 1001 })
      },
      raw: { get: jest.fn(), post: jest.fn() }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(transport.listEntryVersions()).resolves.toEqual(new Map())
    expect(client.entry.getMany).toHaveBeenCalledTimes(1)
  })

  test.each(['sdk', 'raw'])('rejects %s uploads without an id', async mode => {
    const client = {
      upload:
        mode === 'sdk'
          ? { create: jest.fn().mockResolvedValue({ sys: {} }) }
          : undefined,
      raw: {
        get: jest.fn(),
        post: jest.fn().mockResolvedValue({ data: { sys: {} } })
      }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(transport.uploadEntries([])).rejects.toThrow(
      'Upload API did not return an id'
    )
  })

  test('uses the environment upload endpoint in the raw fallback', async () => {
    const client = {
      raw: {
        get: jest.fn(),
        post: jest.fn().mockResolvedValue({ data: { sys: { id: 'up1' } } })
      }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'staging'
    })

    await expect(transport.uploadEntries([])).resolves.toBe('up1')
    expect(client.raw.post).toHaveBeenCalledWith(
      '/spaces/space/environments/staging/uploads',
      expect.any(ArrayBuffer),
      { headers: { 'Content-Type': 'application/octet-stream' } }
    )
  })

  test('polls raw bulk publish actions until they succeed', async () => {
    const client = {
      raw: {
        get: jest.fn().mockResolvedValue({
          data: { sys: { id: 'publish-1', status: 'succeeded' } }
        }),
        post: jest.fn().mockResolvedValue({
          data: { sys: { id: 'publish-1', status: 'inProgress' } }
        })
      }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await transport.publishEntries([{ id: 'a', version: 1 }], {
      sleep: async () => undefined,
      pollIntervalMs: 0,
      pollTimeoutMs: 100
    })

    expect(client.raw.get).toHaveBeenCalledWith(
      '/spaces/space/environments/master/bulk_actions/actions/publish-1'
    )
  })

  test('unwraps direct raw operation responses', async () => {
    const operation = { sys: { id: 'operation-1', status: 'completed' } }
    const client = {
      raw: {
        get: jest.fn().mockResolvedValue(operation),
        post: jest.fn().mockResolvedValue(operation)
      }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await expect(transport.getBulkOperation('operation-1')).resolves.toBe(
      operation
    )
    await expect(
      transport.createBulkOperation('create', 'upload-1')
    ).resolves.toBe(operation)
  })

  test('polls SDK bulk publish actions until they succeed', async () => {
    const client = {
      bulkAction: {
        publish: jest.fn().mockResolvedValue({
          sys: { id: 'publish-1', status: 'inProgress' }
        }),
        get: jest.fn().mockResolvedValue({
          sys: { id: 'publish-1', status: 'succeeded' }
        })
      },
      raw: { get: jest.fn(), post: jest.fn() }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await transport.publishEntries([{ id: 'a', version: 1 }], {
      sleep: async () => undefined,
      pollIntervalMs: 0,
      pollTimeoutMs: 100
    })
    expect(client.bulkAction.get).toHaveBeenCalledTimes(1)
  })

  test('polls a bulk publish action whose initial status is omitted', async () => {
    const client = {
      bulkAction: {
        publish: jest.fn().mockResolvedValue({ sys: { id: 'publish-1' } }),
        get: jest.fn().mockResolvedValue({
          sys: { id: 'publish-1', status: 'succeeded' }
        })
      },
      raw: { get: jest.fn(), post: jest.fn() }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })

    await transport.publishEntries([{ id: 'a', version: 1 }], {
      sleep: async () => undefined,
      pollIntervalMs: 0,
      pollTimeoutMs: 100
    })
    expect(client.bulkAction.get).toHaveBeenCalledTimes(1)
  })

  test('rejects failed, missing-id and timed-out bulk publish actions', async () => {
    const client = {
      bulkAction: {
        publish: jest.fn()
      },
      raw: { get: jest.fn(), post: jest.fn() }
    }
    const transport = createCmaBulkTransport({
      client,
      spaceId: 'space',
      environmentId: 'master'
    })
    const waitOptions = {
      sleep: async () => undefined,
      pollIntervalMs: 0,
      pollTimeoutMs: -1
    }

    client.bulkAction.publish.mockResolvedValueOnce({
      sys: { status: 'created' }
    })
    await expect(
      transport.publishEntries([{ id: 'a', version: 1 }], waitOptions)
    ).rejects.toThrow('Bulk publish did not return an id')

    client.bulkAction.publish.mockResolvedValueOnce({
      sys: { id: 'failed-1', status: 'failed' }
    })
    await expect(
      transport.publishEntries([{ id: 'a', version: 1 }], waitOptions)
    ).rejects.toThrow('Bulk publish failed-1 failed')

    client.bulkAction.publish.mockResolvedValueOnce({
      sys: { id: 'slow-1', status: 'created' }
    })
    await expect(
      transport.publishEntries([{ id: 'a', version: 1 }], waitOptions)
    ).rejects.toThrow('Timed out waiting for bulk publish slow-1')
  })
})

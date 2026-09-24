import { log as defaultLog, warning as defaultWarning } from './log'
import type { PlainClientAPI } from 'contentful-management'

export const MAX_ENTRIES_PER_BULK_JOB = 10_000
export const MAX_ENTITIES_PER_BULK_ACTION = 200

export type BulkOperationAction = 'create' | 'update'

export interface SourceEntry {
  sys?: {
    id?: string
    type?: string
    version?: number
    publishedVersion?: number
    contentType?: {
      sys?: {
        id?: string
        type?: string
        linkType?: string
      }
    }
    [key: string]: unknown
  }
  fields?: Record<string, unknown>
  metadata?: unknown
}

export interface BulkOperationEntityResult {
  status?: string
  entity?: {
    sys?: {
      id?: string
      version?: number
    }
  }
  error?: {
    message?: string
    sys?: { id?: string }
  }
}

export interface BulkOperation {
  sys?: {
    id?: string
    status?: string
  }
  result?: {
    items?: BulkOperationEntityResult[]
  }
}

export interface BulkEntryImportLogger {
  log: (...args: unknown[]) => void
  warning: (...args: unknown[]) => void
}

interface BulkWaitOptions {
  sleep: (ms: number) => Promise<void>
  pollIntervalMs: number
  pollTimeoutMs: number
}

export interface BulkEntryImportTransport {
  listEntryVersions: () => Promise<Map<string, number>>
  uploadEntries: (entries: unknown[]) => Promise<string>
  createBulkOperation: (
    action: BulkOperationAction,
    uploadId: string
  ) => Promise<BulkOperation>
  getBulkOperation: (id: string) => Promise<BulkOperation>
  publishEntries: (
    items: Array<{ id: string; version: number }>,
    waitOptions: BulkWaitOptions
  ) => Promise<void>
}

export interface BulkEntryImportOptions {
  entries: SourceEntry[]
  transport: BulkEntryImportTransport
  skipContentUpdates?: boolean
  skipContentPublishing?: boolean
  logger?: BulkEntryImportLogger
  sleep?: (ms: number) => Promise<void>
  pollIntervalMs?: number
  pollTimeoutMs?: number
}

export class BulkEntryImportError extends Error {
  failures: string[]

  constructor(message: string, failures: string[] = []) {
    super(message)
    this.name = 'BulkEntryImportError'
    this.failures = failures
  }
}

function httpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const withResponse = error as {
    response?: { status?: number }
    status?: number
    message?: string
    name?: string
  }
  const status = withResponse.response?.status ?? withResponse.status
  if (status !== undefined) {
    return status
  }

  if (withResponse.message) {
    try {
      const parsed = JSON.parse(withResponse.message) as { status?: number }
      if (parsed.status !== undefined) {
        return parsed.status
      }
    } catch {
      // The message is not a serialized CMA error.
    }
  }

  const statusFromName = Number.parseInt(withResponse.name || '', 10)
  return Number.isNaN(statusFromName) ? undefined : statusFromName
}

export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error('Chunk size must be greater than 0')
  }

  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export function isPublishedInExport(entry: SourceEntry): boolean {
  return typeof entry.sys?.publishedVersion === 'number'
}

export function prepareEntryForCreate(entry: SourceEntry): SourceEntry {
  return prepareEntry(entry)
}

export function prepareEntryForUpdate(
  entry: SourceEntry,
  version: number
): SourceEntry {
  return prepareEntry(entry, version)
}

function prepareEntry(entry: SourceEntry, version?: number): SourceEntry {
  const sys: SourceEntry['sys'] = { type: 'Entry' }

  if (entry.sys?.id) {
    sys.id = entry.sys.id
  }

  if (entry.sys?.contentType) {
    sys.contentType = entry.sys.contentType
  }

  if (typeof version === 'number') {
    sys.version = version
  }

  const prepared: SourceEntry = { sys, fields: entry.fields || {} }

  if (entry.metadata !== undefined) {
    prepared.metadata = entry.metadata
  }

  return prepared
}

export function partitionEntries(
  entries: SourceEntry[],
  destinationVersions: Map<string, number>,
  skipContentUpdates = false
): { toCreate: SourceEntry[]; toUpdate: SourceEntry[] } {
  const toCreate: SourceEntry[] = []
  const toUpdate: SourceEntry[] = []

  for (const [index, entry] of entries.entries()) {
    const id = entry.sys?.id
    if (!id) {
      throw new BulkEntryImportError(
        `Entry at index ${index} does not include sys.id`
      )
    }

    if (destinationVersions.has(id)) {
      if (!skipContentUpdates) {
        toUpdate.push(
          prepareEntryForUpdate(entry, destinationVersions.get(id) as number)
        )
      }
      continue
    }

    toCreate.push(prepareEntryForCreate(entry))
  }

  return { toCreate, toUpdate }
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function unwrapRaw<T>(response: T | { data: T }): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data
  }
  return response as T
}

function operationStatus(operation: BulkOperation): string {
  return (operation.sys?.status || '').toLowerCase()
}

function isTerminalSuccess(status: string): boolean {
  return status === 'completed' || status === 'succeeded'
}

function isTerminalFailure(status: string): boolean {
  return status === 'failed' || status === 'cancelled' || status === 'canceled'
}

async function waitForBulkOperation(
  transport: BulkEntryImportTransport,
  operation: BulkOperation,
  options: {
    sleep: (ms: number) => Promise<void>
    pollIntervalMs: number
    pollTimeoutMs: number
    action: BulkOperationAction
  }
): Promise<BulkOperation> {
  const id = operation.sys?.id
  if (!id) {
    throw new BulkEntryImportError(
      `Bulk ${options.action} operation response did not include an id`
    )
  }

  const startedAt = Date.now()
  let current = operation

  while (!isTerminalSuccess(operationStatus(current))) {
    if (isTerminalFailure(operationStatus(current))) {
      throw new BulkEntryImportError(
        `Bulk ${options.action} operation ${id} ${operationStatus(current)}`
      )
    }

    if (Date.now() - startedAt > options.pollTimeoutMs) {
      throw new BulkEntryImportError(
        `Timed out waiting for bulk ${options.action} operation ${id}`
      )
    }

    await options.sleep(options.pollIntervalMs)
    current = await transport.getBulkOperation(id)
  }

  return current
}

function collectItemOutcomes(
  operation: BulkOperation,
  submittedEntries: SourceEntry[],
  versions: Map<string, number>,
  failures: string[]
): void {
  const items = operation.result?.items || []
  const submittedVersions = new Map(
    submittedEntries.map(
      entry => [entry.sys?.id as string, (entry.sys?.version || 0) + 1] as const
    )
  )

  for (const [index, item] of items.entries()) {
    const id = item.entity?.sys?.id || submittedEntries[index]?.sys?.id
    const status = (item.status || '').toLowerCase()

    if (status === 'failed') {
      const message =
        item.error?.message || item.error?.sys?.id || 'unknown error'
      failures.push(id ? `${id}: ${message}` : message)
      continue
    }

    if (id) {
      const version = item.entity?.sys?.version ?? submittedVersions.get(id)
      if (typeof version === 'number') {
        versions.set(id, version)
      }
    }
  }
}

async function runBulkJobs(
  action: BulkOperationAction,
  entries: SourceEntry[],
  transport: BulkEntryImportTransport,
  versions: Map<string, number>,
  failures: string[],
  logger: BulkEntryImportLogger,
  waitOptions: {
    sleep: (ms: number) => Promise<void>
    pollIntervalMs: number
    pollTimeoutMs: number
  }
): Promise<void> {
  if (entries.length === 0) {
    return
  }

  const batches = chunk(entries, MAX_ENTRIES_PER_BULK_JOB)
  logger.log(
    `Bulk ${action}: ${entries.length} entries in ${batches.length} job(s)`
  )

  for (const [index, batch] of batches.entries()) {
    logger.log(
      `Uploading bulk ${action} batch ${index + 1}/${batches.length} (${
        batch.length
      } entries)`
    )
    const uploadId = await transport.uploadEntries(batch)
    const started = await transport.createBulkOperation(action, uploadId)
    const completed = await waitForBulkOperation(transport, started, {
      ...waitOptions,
      action
    })
    collectItemOutcomes(completed, batch, versions, failures)
  }
}

export async function importEntriesWithBulkOperations({
  entries,
  transport,
  skipContentUpdates = false,
  skipContentPublishing = false,
  logger = { log: defaultLog, warning: defaultWarning },
  sleep = defaultSleep,
  pollIntervalMs = 2000,
  pollTimeoutMs = 60 * 60 * 1000
}: BulkEntryImportOptions): Promise<{
  created: number
  updated: number
  published: number
  failures: string[]
}> {
  if (entries.length === 0) {
    logger.log('No entries to import via bulk operations')
    return { created: 0, updated: 0, published: 0, failures: [] }
  }

  const destinationVersions = await transport.listEntryVersions()
  const { toCreate, toUpdate } = partitionEntries(
    entries,
    destinationVersions,
    skipContentUpdates
  )
  const versions = new Map(destinationVersions)
  const failures: string[] = []
  const waitOptions = { sleep, pollIntervalMs, pollTimeoutMs }

  await runBulkJobs(
    'create',
    toCreate,
    transport,
    versions,
    failures,
    logger,
    waitOptions
  )
  await runBulkJobs(
    'update',
    toUpdate,
    transport,
    versions,
    failures,
    logger,
    waitOptions
  )

  const writtenIds = new Set(
    [...toCreate, ...toUpdate]
      .map(entry => entry.sys?.id)
      .filter((id): id is string => Boolean(id))
      .filter(id => !failures.some(failure => failure.startsWith(`${id}:`)))
  )

  for (const entry of toCreate) {
    const id = entry.sys?.id
    if (id && writtenIds.has(id) && !versions.has(id)) {
      versions.set(id, 1)
    }
  }

  let published = 0
  if (!skipContentPublishing) {
    const toPublish = entries
      .filter(isPublishedInExport)
      .map(entry => entry.sys?.id)
      .filter((id): id is string => Boolean(id && writtenIds.has(id)))
      .map(id => ({ id, version: versions.get(id) }))
      .filter(
        (item): item is { id: string; version: number } =>
          typeof item.version === 'number'
      )

    const publishBatches = chunk(toPublish, MAX_ENTITIES_PER_BULK_ACTION)
    if (toPublish.length > 0) {
      logger.log(
        `Bulk publish: ${toPublish.length} entries in ${publishBatches.length} action(s)`
      )
    }

    for (const batch of publishBatches) {
      await transport.publishEntries(batch, waitOptions)
      published += batch.length
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      logger.warning(`Bulk entry operation failed for ${failure}`)
    }
    throw new BulkEntryImportError(
      `Bulk entry import finished with ${failures.length} failed item(s)`,
      failures
    )
  }

  logger.log(
    `Finished bulk entry import (${toCreate.length} created, ${toUpdate.length} updated, ${published} published)`
  )

  return {
    created: toCreate.length,
    updated: toUpdate.length,
    published,
    failures
  }
}

export function createCmaBulkTransport({
  client,
  spaceId,
  environmentId
}: {
  client: PlainClientAPI
  spaceId: string
  environmentId: string
}): BulkEntryImportTransport {
  const environmentPath = `/spaces/${spaceId}/environments/${environmentId}`

  return {
    async listEntryVersions() {
      const versions = new Map<string, number>()
      let skip = 0
      const limit = 1000

      let hasMore = true
      while (hasMore) {
        let page: {
          items?: Array<{ sys?: { id?: string; version?: number } }>
          total?: number
        }

        if (client.entry?.getMany) {
          page = await client.entry.getMany({
            spaceId,
            environmentId,
            query: {
              skip,
              limit,
              select: 'sys.id,sys.version'
            }
          })
        } else {
          page = unwrapRaw(
            await client.raw.get(
              `${environmentPath}/entries?skip=${skip}&limit=${limit}&select=sys.id,sys.version`
            )
          ) as {
            items?: Array<{ sys?: { id?: string; version?: number } }>
            total?: number
          }
        }

        for (const item of page.items || []) {
          if (item.sys?.id && typeof item.sys.version === 'number') {
            versions.set(item.sys.id, item.sys.version)
          }
        }

        const total = page.total ?? (page.items || []).length
        skip += limit
        hasMore = skip < total && (page.items || []).length > 0
      }

      return versions
    },

    async uploadEntries(entries) {
      const encoded = Buffer.from(JSON.stringify(entries))
      const file = encoded.buffer.slice(
        encoded.byteOffset,
        encoded.byteOffset + encoded.byteLength
      ) as ArrayBuffer

      if (client.upload?.create) {
        const upload = await client.upload.create(
          { spaceId, environmentId },
          { file }
        )
        const id = upload.sys?.id
        if (!id) {
          throw new BulkEntryImportError('Upload API did not return an id')
        }
        return id
      }

      const upload = unwrapRaw(
        await client.raw.post(`${environmentPath}/uploads`, file, {
          headers: { 'Content-Type': 'application/octet-stream' }
        })
      ) as { sys?: { id?: string } }
      const id = upload.sys?.id
      if (!id) {
        throw new BulkEntryImportError('Upload API did not return an id')
      }
      return id
    },

    async createBulkOperation(action, uploadId) {
      try {
        return unwrapRaw(
          await client.raw.post(
            `${environmentPath}/bulk_operations/entries/${action}`,
            {
              upload: {
                sys: {
                  type: 'Upload',
                  id: uploadId
                }
              }
            }
          )
        ) as BulkOperation
      } catch (error) {
        if (httpStatus(error) === 403) {
          throw new BulkEntryImportError(
            'Bulk Entry Operations are not available for this space. This feature requires Bulk Content Operations (Premium). See https://www.contentful.com/developers/docs/references/content-management-api/bulk-entry-content-operations/'
          )
        }
        throw error
      }
    },

    async getBulkOperation(id) {
      return unwrapRaw(
        await client.raw.get(`${environmentPath}/bulk_operations/${id}`)
      ) as BulkOperation
    },

    async publishEntries(items, waitOptions) {
      const payload = {
        entities: {
          sys: { type: 'Array' as const },
          items: items.map(({ id, version }) => ({
            sys: {
              type: 'Link' as const,
              linkType: 'Entry' as const,
              id,
              version
            }
          }))
        }
      }

      let action: { sys?: { id?: string; status?: string } }
      if (client.bulkAction?.publish) {
        action = await client.bulkAction.publish(
          { spaceId, environmentId },
          payload
        )
      } else {
        action = unwrapRaw<{ sys?: { id?: string; status?: string } }>(
          await client.raw.post(
            `${environmentPath}/bulk_actions/publish`,
            payload
          )
        )
      }

      const actionId = action.sys?.id
      if (!actionId) {
        throw new BulkEntryImportError('Bulk publish did not return an id')
      }

      const startedAt = Date.now()
      while (!isTerminalSuccess((action.sys?.status || '').toLowerCase())) {
        if (isTerminalFailure((action.sys?.status || '').toLowerCase())) {
          throw new BulkEntryImportError(`Bulk publish ${actionId} failed`)
        }
        if (Date.now() - startedAt > waitOptions.pollTimeoutMs) {
          throw new BulkEntryImportError(
            `Timed out waiting for bulk publish ${actionId}`
          )
        }
        await waitOptions.sleep(waitOptions.pollIntervalMs)
        if (client.bulkAction?.get) {
          action = await client.bulkAction.get({
            spaceId,
            environmentId,
            bulkActionId: actionId
          })
        } else {
          action = unwrapRaw<{ sys?: { id?: string; status?: string } }>(
            await client.raw.get(
              `${environmentPath}/bulk_actions/actions/${actionId}`
            )
          )
        }
      }
    }
  }
}

import type { SecurityCheck, SecurityContext, SecurityCheckRunResult } from './types'

interface AccessTokenSys {
  expiresAt?: string | null
  id?: string
}
interface AccessTokenItem {
  revokedAt?: string | null
  sys?: AccessTokenSys
}
interface AccessTokenCollectionShape {
  total?: number
  limit?: number
  skip?: number
  items?: AccessTokenItem[]
}
interface AccessTokenResponseAxiosLike {
  data?: AccessTokenCollectionShape
  total?: number
  limit?: number
  skip?: number
  items?: AccessTokenItem[]
}

function extractItems(resp: AccessTokenResponseAxiosLike): AccessTokenItem[] {
  return resp?.data?.items || resp?.items || []
}
function extractTotal(resp: AccessTokenResponseAxiosLike): number | undefined {
  return resp?.data?.total ?? resp?.total
}
function extractLimit(resp: AccessTokenResponseAxiosLike): number | undefined {
  return resp?.data?.limit ?? resp?.limit
}

export const activeTokensWithoutExpiryCheck: SecurityCheck = {
  id: 'active_tokens_without_expiry',
  description: 'Active (not revoked) access tokens without an expiration date (revokedAt=null & sys.expiresAt=null).',
  dependsOn: ['permission_check'],
  async run(ctx: SecurityContext): Promise<SecurityCheckRunResult> {
    const { client, organizationId } = ctx
    const basePath = `/organizations/${organizationId}/access_tokens`

    const offendingTokenIds: string[] = []
    const limit = 100
    let skip = 0
    let processed = 0
    let total: number | undefined
    let done = false

    // Use current timestamp for filtering future-expiring tokens (so we still retrieve indefinite tokens)
    const nowISO = new Date().toISOString()

    try {
      while (!done) {
        const resp = (await client.raw.get(basePath, {
          params: {
            include: 'sys.user',
            limit,
            order: '-sys.createdAt',
            skip,
            // Bracket param key to match API expectation
            'sys.expiresAt[gt]': nowISO,
            // The 'revokedAt' param (without value) is represented here as an empty string key if supported; omit value.
            revokedAt: ''
          }
        })) as AccessTokenResponseAxiosLike

        const items = extractItems(resp)
        if (total === undefined) total = extractTotal(resp)
        const effectiveLimit = extractLimit(resp) || limit

        for (const item of items) {
          const revoked = item?.revokedAt
          const expiresAt = item?.sys?.expiresAt
          if (revoked == null && expiresAt == null) {
            const id = item?.sys?.id
            if (id) offendingTokenIds.push(id)
          }
          processed += 1
        }

        skip += effectiveLimit

        if (items.length === 0) done = true
        else if (total !== undefined && processed >= total) done = true
        else if (items.length < effectiveLimit) done = true
      }

      const count = offendingTokenIds.length
      return {
        pass: count === 0,
        data: {
          offendingCount: count
        }
      }
    } catch (_) {
      return {
        pass: false,
        data: { error: 'fetch_failed' }
      }
    }
  }
}

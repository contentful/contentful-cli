import type {
  SecurityCheck,
  SecurityContext,
  SecurityCheckRunResult
} from './types'

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

export const activeTokensWithLongExpiryCheck: SecurityCheck = {
  id: 'active_tokens_with_long_expiry',
  description: 'Active (not revoked) access tokens with an expiration date > 1 year',
  dependsOn: ['permission_check'],
  async run(ctx: SecurityContext): Promise<SecurityCheckRunResult> {
    const { client, organizationId } = ctx
    const basePath = `/organizations/${organizationId}/access_tokens`

    let offendingCount = 0
    const limit = 100
    let skip = 0
    let processed = 0
    let total: number | undefined
    let done = false

    const now = new Date()
    const oneYearAhead = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    const sdkAccessor: any = (client as any)?.accessToken?.getManyForOrganization

    async function fetchPage(currentSkip: number): Promise<AccessTokenResponseAxiosLike> {
      if (typeof sdkAccessor === 'function') {
        try {
          const collection = await sdkAccessor({
            organizationId,
            query: {
              include: 'sys.user',
              limit,
              order: '-sys.createdAt',
              skip: currentSkip,
              'sys.expiresAt[gt]': now.toISOString(),
              revokedAt: ''
            }
          })
          return collection as AccessTokenResponseAxiosLike
        } catch (_) {}
      }
      return (await client.raw.get(basePath, {
        params: {
          include: 'sys.user',
          limit,
          order: '-sys.createdAt',
          skip: currentSkip,
          'sys.expiresAt[gt]': now.toISOString(),
          revokedAt: ''
        }
      })) as AccessTokenResponseAxiosLike
    }

    try {
      while (!done) {
        const resp = await fetchPage(skip)
        const items = extractItems(resp)
        if (total === undefined) total = extractTotal(resp)
        const effectiveLimit = extractLimit(resp) || limit

        for (const item of items) {
          const revoked = item?.revokedAt
            ; (revoked) // no-op to satisfy linter if unused
          const expiresAt = item?.sys?.expiresAt
          if (item?.revokedAt == null && expiresAt) {
            const expDate = new Date(expiresAt)
            if (expDate > oneYearAhead) offendingCount += 1
          }
          processed += 1
        }

        skip += effectiveLimit
        if (items.length === 0) done = true
        else if (total !== undefined && processed >= total) done = true
        else if (items.length < effectiveLimit) done = true
      }

      return { pass: offendingCount === 0, data: { offendingCount } }
    } catch (_) {
      return { pass: false, data: { error: 'fetch_failed' } }
    }
  }
}

// Backwards compatibility: keep previous export name but pointing to new logic (if anything else imports it)
export { activeTokensWithLongExpiryCheck as activeTokensWithoutExpiryCheck }

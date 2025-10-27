import type {
  SecurityCheck,
  SecurityContext,
  SecurityCheckRunResult
} from './types'

interface MembershipUserLinkSys {
  type?: string
  linkType?: string
  id?: string
}
interface MembershipUserLink {
  sys?: MembershipUserLinkSys
}
interface MembershipSys {
  type?: string
  id?: string
  version?: number
  user?: MembershipUserLink
}
interface MembershipItem {
  role?: string
  isExemptFromRestrictedMode?: boolean
  sys?: MembershipSys
  user?: MembershipUserLink // fallback shape
}
interface MembershipCollection {
  total?: number
  limit?: number
  skip?: number
  items?: MembershipItem[]
}
interface MembershipResponseAxiosLike {
  data?: MembershipCollection
  total?: number
  limit?: number
  skip?: number
  items?: MembershipItem[]
}

function extractItems(resp: MembershipResponseAxiosLike): MembershipItem[] {
  return resp?.data?.items || resp?.items || []
}
function extractTotal(resp: MembershipResponseAxiosLike): number | undefined {
  return resp?.data?.total ?? resp?.total
}
function extractLimit(resp: MembershipResponseAxiosLike): number | undefined {
  return resp?.data?.limit ?? resp?.limit
}

function extractUserIdFromItem(item: MembershipItem): string | null {
  return item?.sys?.user?.sys?.id || item?.user?.sys?.id || null
}

export const ssoExemptUsersCheck: SecurityCheck = {
  id: 'sso_exempt_users',
  description: 'Check if users are exempted from SSO restricted mode (bypass SSO).',
  dependsOn: ['permission_check', 'sso_enabled', 'sso_enforced'],
  async run(ctx: SecurityContext): Promise<SecurityCheckRunResult> {
    const { client, organizationId } = ctx
    const exemptUserIds: string[] = []

    const basePath = `/organizations/${organizationId}/organization_memberships`
    let skip = 0
    const pageLimit = 100
    let total: number | undefined
    let processedCount = 0
    let done = false

    try {
      while (!done) {
        const resp = (await client.raw.get(basePath, {
          params: { limit: pageLimit, skip }
        })) as MembershipResponseAxiosLike

        const items = extractItems(resp)
        if (total === undefined) {
          total = extractTotal(resp)
        }
        const limit = extractLimit(resp) ?? pageLimit

        for (const item of items) {
          processedCount += 1
          if (item?.isExemptFromRestrictedMode) {
            const uid = extractUserIdFromItem(item)
            if (uid) exemptUserIds.push(uid)
          }
        }

        // Advance pagination
        skip += limit

        // Determine completion
        if (items.length === 0) {
          done = true
        } else if (total !== undefined && processedCount >= total) {
          done = true
        } else if (items.length < limit) {
          done = true
        }
      }

      // Pass is true only if there are NO exempt users.
      const hasExemptions = exemptUserIds.length > 0
      return {
        pass: !hasExemptions,
        data: { exemptUserIds, exemptCount: exemptUserIds.length }
      }
    } catch (_) {
      return {
        pass: false,
        data: {
          exemptUserIds,
          exemptCount: exemptUserIds.length,
          error: 'fetch_failed'
        }
      }
    }
  }
}

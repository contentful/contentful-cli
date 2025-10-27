import type {
  SecurityCheck,
  SecurityContext,
  SecurityCheckRunResult
} from './types'

interface MembershipUserLinkSys {
  id?: string
}
interface MembershipUserLink {
  sys?: MembershipUserLinkSys
}
interface MembershipItem {
  isExemptFromRestrictedMode?: boolean
  user?: MembershipUserLink
  sys?: { user?: MembershipUserLink }
}
interface MembershipCollection {
  items?: MembershipItem[]
  total?: number
  limit?: number
}
interface MembershipResponseAxiosLike {
  data?: MembershipCollection
  items?: MembershipItem[]
  total?: number
  limit?: number
}
interface OrgUserResponse {
  email?: string
  '2faEnabled'?: boolean
  data?: { email?: string; '2faEnabled'?: boolean }
}

function extractItems(resp: MembershipResponseAxiosLike): MembershipItem[] {
  return resp?.data?.items || resp?.items || []
}
function extractLimit(resp: MembershipResponseAxiosLike): number {
  return resp?.data?.limit ?? resp?.limit ?? 100
}
function extractTotal(resp: MembershipResponseAxiosLike): number | undefined {
  return resp?.data?.total ?? resp?.total
}
function extractUserId(item: MembershipItem): string | null {
  return item?.user?.sys?.id || item?.sys?.user?.sys?.id || null
}
function isExempt(item: MembershipItem): boolean {
  return !!item?.isExemptFromRestrictedMode
}
function extractUserEmail(user: OrgUserResponse): string | undefined {
  return user?.data?.email || user?.email
}
function extract2fa(user: OrgUserResponse): boolean | undefined {
  return user?.data?.['2faEnabled'] ?? user?.['2faEnabled']
}

export const ssoExemptUsersWithMfaDisabledCheck: SecurityCheck = {
  id: 'sso_exempt_users_with_mfa_disabled',
  description:
    'Exempt users have MFA (2FA) enabled (reports users without MFA).',
  dependsOn: ['permission_check', 'sso_enabled', 'sso_enforced'],
  async run(ctx: SecurityContext): Promise<SecurityCheckRunResult> {
    const { client, organizationId } = ctx
    const basePath = `/organizations/${organizationId}/organization_memberships`

    const exemptUserIds: string[] = []
    let skip = 0
    const pageLimit = 100
    let done = false
    let total: number | undefined

    try {
      while (!done) {
        const resp = (await client.raw.get(basePath, {
          params: { limit: pageLimit, skip }
        })) as MembershipResponseAxiosLike
        const items = extractItems(resp)
        if (total === undefined) total = extractTotal(resp)
        const limit = extractLimit(resp)
        for (const item of items) {
          if (isExempt(item)) {
            const uid = extractUserId(item)
            if (uid) exemptUserIds.push(uid)
          }
        }
        skip += limit
        if (items.length === 0) done = true
        else if (total !== undefined && skip >= total) done = true
        else if (items.length < limit) done = true
      }

      if (exemptUserIds.length === 0) {
        return {
          pass: true,
          data: {
            mfaDisabledUsers: [],
            mfaDisabledCount: 0
          }
        }
      }

      const exemptUsers: Array<{
        id: string
        email: string | null
        mfaEnabled: boolean | null
      }> = []

      for (const uid of exemptUserIds) {
        try {
          const userResp = (await client.raw.get(
            `/organizations/${organizationId}/users/${uid}`
          )) as OrgUserResponse
          const email = extractUserEmail(userResp) || null
          const twoFa = extract2fa(userResp)
          exemptUsers.push({ id: uid, email, mfaEnabled: twoFa ?? null })
        } catch (_) {
          // On fetch failure capture unknown state
          exemptUsers.push({ id: uid, email: null, mfaEnabled: null })
        }
      }

      const mfaDisabledUsers = exemptUsers.filter(u => u.mfaEnabled === false)
      const pass = mfaDisabledUsers.length === 0

      return {
        pass,
        data: {
          mfaDisabledUsers: mfaDisabledUsers.map(u => ({
            id: u.id,
            email: u.email
          })),
          mfaDisabledCount: mfaDisabledUsers.length
        }
      }
    } catch (_) {
      return {
        pass: false,
        data: {
          error: 'fetch_failed',
          mfaDisabledUsers: [],
          mfaDisabledCount: 0
        }
      }
    }
  }
}

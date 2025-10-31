import { ssoExemptUsersWithMfaDisabledCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/sso_exempt_users_with_mfa_disabled'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

describe('ssoExemptUsersWithMfaDisabledCheck', () => {
  function makeCtx(membershipPages: Array<{ items: any[]; total?: number; limit?: number }>, userMap: Record<string, { email?: string; '2faEnabled'?: boolean }>|null, shouldThrow = false): SecurityContext {
    let membershipCall = 0
    const rawGet = jest.fn().mockImplementation(async (path: string) => {
      if (path.includes('/organization_memberships')) {
        if (shouldThrow) throw new Error('membership_error')
        const page = membershipPages[membershipCall++] || { items: [] }
        return { data: { items: page.items, total: page.total ?? membershipPages.reduce((acc,p)=>acc+p.items.length,0), limit: page.limit ?? 100 } }
      }
      if (path.includes('/users/')) {
        if (!userMap) throw new Error('user_fetch_error')
        const uid = path.split('/').pop() as string
        const data = userMap[uid] || {}
        return { data }
      }
      throw new Error('unexpected_path')
    })
    return {
      client: { raw: { get: rawGet } } as any,
      organizationId: 'org1',
      userId: 'userSelf',
      role: 'owner'
    }
  }

  test('passes when no exempt users', async () => {
    const ctx = makeCtx([{ items: [{ isExemptFromRestrictedMode: false }] }], {})
    const res = await ssoExemptUsersWithMfaDisabledCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.mfaDisabledCount).toBe(0)
  })

  test('passes when exempt user has MFA enabled', async () => {
    const ctx = makeCtx([{ items: [{ isExemptFromRestrictedMode: true, sys: { user: { sys: { id: 'u2' } } } }] }], { u2: { email: 'u2@mail.com', '2faEnabled': true } })
    const res = await ssoExemptUsersWithMfaDisabledCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.mfaDisabledCount).toBe(0)
  })

  test('fails when exempt user has MFA disabled', async () => {
    const ctx = makeCtx([{ items: [{ isExemptFromRestrictedMode: true, sys: { user: { sys: { id: 'u3' } } } }] }], { u3: { email: 'u3@mail.com', '2faEnabled': false } })
    const res = await ssoExemptUsersWithMfaDisabledCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.mfaDisabledCount).toBe(1)
  })

  test('fails on membership fetch error', async () => {
    const ctx = makeCtx([{ items: [] }], {}, true)
    const res = await ssoExemptUsersWithMfaDisabledCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.error).toBe('fetch_failed')
  })
})


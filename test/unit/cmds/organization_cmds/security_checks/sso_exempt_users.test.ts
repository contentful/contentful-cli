import { ssoExemptUsersCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/sso_exempt_users'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

describe('ssoExemptUsersCheck', () => {
  function makeCtx(pages: Array<{ items: any[]; total?: number; limit?: number }>, shouldThrow = false): SecurityContext {
    let call = 0
    const rawGet = jest.fn().mockImplementation(async (path: string) => {
      if (!path.includes('/organization_memberships')) throw new Error('unexpected path')
      if (shouldThrow) throw new Error('network')
      const page = pages[call++] || { items: [] }
      return { data: { items: page.items, total: page.total ?? pages.reduce((acc,p)=>acc+p.items.length,0), limit: page.limit ?? 100 } }
    })
    return {
      client: { raw: { get: rawGet } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }
  }

  test('passes when no exempt users', async () => {
    const ctx = makeCtx([{ items: [{ isExemptFromRestrictedMode: false }] }])
    const res = await ssoExemptUsersCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.exemptCount).toBe(0)
  })

  test('fails when exempt user present', async () => {
    const ctx = makeCtx([{ items: [{ isExemptFromRestrictedMode: true, sys: { user: { sys: { id: 'u2' } } } }] }])
    const res = await ssoExemptUsersCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.exemptCount).toBe(1)
  })

  test('fails on fetch error', async () => {
    const ctx = makeCtx([{ items: [] }], true)
    const res = await ssoExemptUsersCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.error).toBe('fetch_failed')
  })
})


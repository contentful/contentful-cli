import { activeTokensWithoutExpiryCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/active_tokens_without_expiry'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

describe('activeTokensWithoutExpiryCheck', () => {
  function makeCtx(pages: Array<{ items: any[]; total?: number; limit?: number }>, throwOnPage = false): SecurityContext {
    let call = 0
    const rawGet = jest.fn().mockImplementation(async (path: string) => {
      if (!path.includes('/access_tokens')) throw new Error('unexpected path')
      if (throwOnPage) throw new Error('network')
      const page = pages[call++] || { items: [] }
      return { data: { items: page.items, total: page.total ?? pages.reduce((a,p)=>a+p.items.length,0), limit: page.limit ?? 100 } }
    })
    return {
      client: { raw: { get: rawGet } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }
  }

  test('passes when no offending tokens', async () => {
    const ctx = makeCtx([{ items: [ { revokedAt: '2024-01-01', sys: { expiresAt: '2025-01-01' } } ] }])
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(0)
  })

  test('fails when offending tokens present', async () => {
    const ctx = makeCtx([{ items: [ { revokedAt: null, sys: { expiresAt: null } }, { revokedAt: null, sys: { expiresAt: null } } ] }])
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(2)
  })

  test('fails on fetch error', async () => {
    const ctx = makeCtx([{ items: [] }], true)
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.error).toBe('fetch_failed')
  })
})


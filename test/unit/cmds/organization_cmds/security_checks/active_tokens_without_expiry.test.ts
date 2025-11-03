import { activeTokensWithoutExpiryCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/active_tokens_without_expiry'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

describe('activeTokensWithoutExpiryCheck', () => {
  function makeCtx(pages: Array<{ items: any[]; total?: number; limit?: number }>, throwOnPage = false): SecurityContext & { __rawGet: jest.Mock } {
    let call = 0
    const rawGet = jest.fn().mockImplementation(async (path: string) => {
      if (!path.includes('/access_tokens')) throw new Error('unexpected path')
      if (throwOnPage) throw new Error('network')
      const page = pages[call++] || { items: [] }
      return { data: { items: page.items, total: page.total ?? pages.reduce((a,p)=>a+p.items.length,0), limit: page.limit ?? 100 } }
    })
    return Object.assign({
      client: { raw: { get: rawGet } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }, { __rawGet: rawGet })
  }

  test('passes when no offending tokens', async () => {
    const ctx = makeCtx([{ items: [ { revokedAt: '2024-01-01', sys: { expiresAt: '2025-01-01' } } ] }])
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(ctx.__rawGet).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(0)
  })

  test('fails when offending tokens present', async () => {
    const ctx = makeCtx([{ items: [ { revokedAt: null, sys: { expiresAt: null } }, { revokedAt: null, sys: { expiresAt: null } } ] }])
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(ctx.__rawGet).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(2)
  })

  test('handles multi-page pagination and aggregates offending count', async () => {
    // First page: 100 safe tokens (revoked or with expiry)
    const safeItems = Array.from({ length: 100 }, (_, i) => ({ revokedAt: i % 2 === 0 ? '2024-01-01' : null, sys: { expiresAt: i % 2 === 0 ? null : '2099-01-01' } }))
    // Second page: 2 offending tokens
    const offending = [ { revokedAt: null, sys: { expiresAt: null } }, { revokedAt: null, sys: { expiresAt: null } } ]
    const total = safeItems.length + offending.length
    const ctx = makeCtx([
      { items: safeItems, total, limit: 100 },
      { items: offending, total, limit: 100 }
    ])
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(ctx.__rawGet).toHaveBeenCalledTimes(2)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(2)
  })

  test('fails on fetch error', async () => {
    const ctx = makeCtx([{ items: [] }], true)
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(ctx.__rawGet).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.error).toBe('fetch_failed')
  })

  test('uses SDK accessor when available (no data wrapper)', async () => {
    const sdkFn = jest.fn().mockResolvedValue({
      items: [
        { revokedAt: null, sys: { expiresAt: '2099-01-01' } },
        { revokedAt: '2024-01-01', sys: { expiresAt: null } },
        { revokedAt: null, sys: { expiresAt: null } } // offending
      ],
      total: 3,
      limit: 100
    })
    const ctx: SecurityContext = {
      client: { accessToken: { getManyForOrganization: sdkFn }, raw: { get: jest.fn() } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(sdkFn).toHaveBeenCalledTimes(1)
    // raw.get should not have been needed
    // @ts-ignore
    expect(ctx.client.raw.get).not.toHaveBeenCalled()
    // @ts-ignore
    expect(res.data.offendingCount).toBe(1)
    // @ts-ignore
    expect(res.pass).toBe(false)
  })

  test('falls back to raw when SDK accessor throws', async () => {
    const sdkFn = jest.fn().mockRejectedValue(new Error('boom'))
    const rawGet = jest.fn().mockResolvedValue({ data: { items: [ { revokedAt: null, sys: { expiresAt: null } } ], total: 1, limit: 100 } })
    const ctx: SecurityContext = {
      client: { accessToken: { getManyForOrganization: sdkFn }, raw: { get: rawGet } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(sdkFn).toHaveBeenCalled()
    expect(rawGet).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(1)
    // @ts-ignore
    expect(res.pass).toBe(false)
  })
})

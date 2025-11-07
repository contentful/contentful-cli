import { activeTokensWithoutExpiryCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/active_tokens_with_long_expiry'
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

  const ONE_DAY_MS = 24 * 60 * 60 * 1000
  const now = Date.now()
  const withinYear = new Date(now + 100 * ONE_DAY_MS).toISOString() // ~100 days
  const overYear = new Date(now + 400 * ONE_DAY_MS).toISOString() // > 1 year

  test('passes when no offending tokens', async () => {
    const ctx = makeCtx([{ items: [ { revokedAt: '2024-01-01', sys: { expiresAt: overYear } }, { revokedAt: null, sys: { expiresAt: withinYear } }, { revokedAt: null, sys: { expiresAt: null } } ] }])
    // Note: first token is revoked so ignored; second within 1 year; third has no expiry (also ignored)
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(ctx.__rawGet).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(0)
  })

  test('fails when offending tokens present', async () => {
    const ctx = makeCtx([{ items: [ { revokedAt: null, sys: { expiresAt: overYear } }, { revokedAt: null, sys: { expiresAt: overYear } } ] }])
    const res = await activeTokensWithoutExpiryCheck.run(ctx)
    expect(ctx.__rawGet).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.offendingCount).toBe(2)
  })

  test('handles multi-page pagination and aggregates offending count', async () => {
    const safeItems = Array.from({ length: 100 }, (_, i) => ({ revokedAt: i % 2 === 0 ? '2024-01-01' : null, sys: { expiresAt: i % 2 === 0 ? null : withinYear } }))
    const offending = [ { revokedAt: null, sys: { expiresAt: overYear } }, { revokedAt: null, sys: { expiresAt: overYear } } ]
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
        { revokedAt: null, sys: { expiresAt: overYear } }, // offending
        { revokedAt: '2024-01-01', sys: { expiresAt: overYear } }, // revoked -> ignored
        { revokedAt: null, sys: { expiresAt: withinYear } } // within year -> safe
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
    // @ts-ignore
    expect(ctx.client.raw.get).not.toHaveBeenCalled()
    // @ts-ignore
    expect(res.data.offendingCount).toBe(1)
    // @ts-ignore
    expect(res.pass).toBe(false)
  })

  test('falls back to raw when SDK accessor throws', async () => {
    const sdkFn = jest.fn().mockRejectedValue(new Error('boom'))
    const rawGet = jest.fn().mockResolvedValue({ data: { items: [ { revokedAt: null, sys: { expiresAt: overYear } } ], total: 1, limit: 100 } })
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

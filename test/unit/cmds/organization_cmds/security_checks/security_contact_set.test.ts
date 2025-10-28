import { securityContactSetCheck } from '../../../../../../lib/cmds/organization_cmds/security_checks/security_contact_set'
import type { SecurityContext } from '../../../../../../lib/cmds/organization_cmds/security_checks/types'

// Minimal mock PlainClient
function makeClient(total: number | undefined, items: unknown[] | undefined, shouldThrow = false) {
  return {
    raw: {
      get: async (path: string) => {
        if (shouldThrow) throw new Error('fetch_failed')
        if (path.endsWith('/security_contacts')) {
          return { data: { total, items } }
        }
        throw new Error('unexpected path')
      }
    }
  }
}

const ORG_ID = 'org123'

describe('securityContactSetCheck', () => {
  test('passes when at least one contact exists (total provided)', async () => {
    const ctx: SecurityContext = {
      client: makeClient(2, [{ id: 'a' }, { id: 'b' }]) as any,
      organizationId: ORG_ID,
      userId: 'user1',
      role: 'owner'
    }
    const res = await securityContactSetCheck.run(ctx)
    expect(typeof res).toBe('object')
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data?.contactCount).toBe(2)
  })

  test('passes when items length > 0 (no total)', async () => {
    const ctx: SecurityContext = {
      client: makeClient(undefined, [{ id: 'only' }]) as any,
      organizationId: ORG_ID,
      userId: 'user1',
      role: 'admin'
    }
    const res = await securityContactSetCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data?.contactCount).toBe(1)
  })

  test('fails when no contacts (total 0)', async () => {
    const ctx: SecurityContext = {
      client: makeClient(0, []) as any,
      organizationId: ORG_ID,
      userId: 'user1',
      role: 'admin'
    }
    const res = await securityContactSetCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data?.contactCount).toBe(0)
  })

  test('fails when fetch throws', async () => {
    const ctx: SecurityContext = {
      client: makeClient(undefined, undefined, true) as any,
      organizationId: ORG_ID,
      userId: 'user1',
      role: 'owner'
    }
    const res = await securityContactSetCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data?.error).toBe('fetch_failed')
  })
})


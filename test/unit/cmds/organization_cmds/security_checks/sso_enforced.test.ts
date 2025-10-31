import { ssoEnforcedCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/sso_enforced'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

describe('ssoEnforcedCheck', () => {
  function ctx(resp: any, role = 'owner'): SecurityContext {
    return {
      client: { raw: { get: async () => resp } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role
    }
  }
  test('passes when restricted true (data)', async () => {
    expect(await ssoEnforcedCheck.run(ctx({ data: { restricted: true } }))).toBe(true)
  })
  test('passes when restricted true (root)', async () => {
    expect(await ssoEnforcedCheck.run(ctx({ restricted: true }))).toBe(true)
  })
  test('fails when restricted false', async () => {
    expect(await ssoEnforcedCheck.run(ctx({ data: { restricted: false } }))).toBe(false)
  })
  test('fails on error', async () => {
    const errorCtx: SecurityContext = {
      client: { raw: { get: async () => { throw new Error('network') } } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }
    expect(await ssoEnforcedCheck.run(errorCtx)).toBe(false)
  })
})


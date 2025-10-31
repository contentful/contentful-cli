import { ssoEnabledCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/sso_enabled'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

describe('ssoEnabledCheck', () => {
  function makeCtx(resp: any): SecurityContext {
    return {
      client: { raw: { get: async () => resp } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }
  }

  test('passes when data.enabled true', async () => {
    expect(await ssoEnabledCheck.run(makeCtx({ data: { enabled: true } }))).toBe(true)
  })

  test('passes when enabled root true', async () => {
    expect(await ssoEnabledCheck.run(makeCtx({ enabled: true }))).toBe(true)
  })

  test('fails when disabled', async () => {
    expect(await ssoEnabledCheck.run(makeCtx({ data: { enabled: false } }))).toBe(false)
  })

  test('fails on error', async () => {
    const ctx: SecurityContext = {
      client: { raw: { get: async () => { throw new Error('network') } } } as any,
      organizationId: 'org1',
      userId: 'user1',
      role: 'owner'
    }
    expect(await ssoEnabledCheck.run(ctx)).toBe(false)
  })
})


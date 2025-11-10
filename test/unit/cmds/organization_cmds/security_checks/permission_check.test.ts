import { permissionCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/permission'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

describe('permissionCheck', () => {
  function ctx(role?: string): SecurityContext {
    return {
      client: { raw: { get: async () => ({}) } } as any,
      organizationId: 'org',
      userId: 'user',
      role
    }
  }
  test('passes for owner', async () => {
    expect(await permissionCheck.run(ctx('owner'))).toBe(true)
  })
  test('passes for admin', async () => {
    expect(await permissionCheck.run(ctx('admin'))).toBe(true)
  })
  test('fails for member', async () => {
    expect(await permissionCheck.run(ctx('member'))).toBe(false)
  })
  test('fails for undefined role', async () => {
    expect(await permissionCheck.run(ctx(undefined))).toBe(false)
  })
})

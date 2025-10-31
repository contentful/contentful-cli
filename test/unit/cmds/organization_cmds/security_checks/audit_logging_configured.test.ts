import { auditLoggingConfiguredCheck } from '../../../../../lib/cmds/organization_cmds/security_checks/audit_logging_configured'
import type { SecurityContext } from '../../../../../lib/cmds/organization_cmds/security_checks/types'

const ORG = 'org123'

describe('auditLoggingConfiguredCheck', () => {
  function makeCtx(items: unknown[] | null, shouldThrow = false): SecurityContext {
    const rawGet = jest.fn().mockImplementation(async (path: string, opts?: any) => {
      if (!path.includes('/audit_logging/configurations')) throw new Error('unexpected')
      if (shouldThrow) throw new Error('network')
      // assert header presence
      if (!opts || !opts.headers || opts.headers['x-contentful-enable-alpha-feature'] !== 'audit-logging') {
        throw new Error('missing alpha header')
      }
      return { data: { items: items ?? [] } }
    })
    return {
      client: { raw: { get: rawGet } } as any,
      organizationId: ORG,
      userId: 'u1',
      role: 'owner'
    }
  }

  test('fails when items empty', async () => {
    const ctx = makeCtx([])
    const res = await auditLoggingConfiguredCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.itemCount).toBe(0)
  })

  test('passes when items present', async () => {
    const ctx = makeCtx([{}, {}])
    const res = await auditLoggingConfiguredCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.itemCount).toBe(2)
  })

  test('fails on fetch error', async () => {
    const ctx = makeCtx(null, true)
    const res = await auditLoggingConfiguredCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.error).toBe('fetch_failed')
  })
})

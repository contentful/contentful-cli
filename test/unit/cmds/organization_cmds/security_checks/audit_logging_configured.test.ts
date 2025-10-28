import { auditLoggingConfiguredCheck } from '../../../../../../lib/cmds/organization_cmds/security_checks/audit_logging_configured'
import type { SecurityContext } from '../../../../../../lib/cmds/organization_cmds/security_checks/types'
import { createPlainClient } from '../../../../../../lib/utils/contentful-clients'

jest.mock('../../../../../../lib/utils/contentful-clients')

function mockClient(items: unknown[] | null, shouldThrow = false) {
  const rawGet = jest.fn().mockImplementation(async (path: string) => {
    if (shouldThrow) throw new Error('network')
    if (path.includes('/audit_logging/configurations')) {
      return { data: { items: items ?? [] } }
    }
    throw new Error('unexpected')
  })
  ;(createPlainClient as unknown as jest.Mock).mockResolvedValue({ raw: { get: rawGet } })
  return rawGet
}

const ORG = 'org123'

describe('auditLoggingConfiguredCheck', () => {
  test('fails when items empty', async () => {
    mockClient([])
    const ctx: SecurityContext = {
      client: { raw: { get: async () => ({}) } } as any,
      organizationId: ORG,
      userId: 'u1',
      role: 'owner',
      accessToken: 'token'
    }
    const res = await auditLoggingConfiguredCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.itemCount).toBe(0)
  })

  test('passes when items present', async () => {
    mockClient([{}, {}])
    const ctx: SecurityContext = {
      client: { raw: { get: async () => ({}) } } as any,
      organizationId: ORG,
      userId: 'u1',
      role: 'admin',
      accessToken: 'token'
    }
    const res = await auditLoggingConfiguredCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(true)
    // @ts-ignore
    expect(res.data.itemCount).toBe(2)
  })

  test('fails on fetch error', async () => {
    mockClient(null, true)
    const ctx: SecurityContext = {
      client: { raw: { get: async () => ({}) } } as any,
      organizationId: ORG,
      userId: 'u1',
      role: 'owner',
      accessToken: 'token'
    }
    const res = await auditLoggingConfiguredCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.error).toBe('fetch_failed')
  })

  test('fails when missing token', async () => {
    mockClient([{}])
    const ctx: SecurityContext = {
      client: { raw: { get: async () => ({}) } } as any,
      organizationId: ORG,
      userId: 'u1',
      role: 'owner'
    }
    const res = await auditLoggingConfiguredCheck.run(ctx)
    // @ts-ignore
    expect(res.pass).toBe(false)
    // @ts-ignore
    expect(res.data.error).toBe('missing_token')
  })
})


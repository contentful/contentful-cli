import type { SecurityCheck, SecurityContext, SecurityCheckRunResult } from './types'

interface AuditLoggingCollectionShape {
  items?: unknown[]
}
interface AuditLoggingResponseAxiosLike {
  data?: AuditLoggingCollectionShape
  items?: unknown[]
}

function extractItems(resp: AuditLoggingResponseAxiosLike): unknown[] {
  return resp?.data?.items || resp?.items || []
}

export const auditLoggingConfiguredCheck: SecurityCheck = {
  id: 'audit_logging_configured',
  description: 'Audit logging is configured for the organization',
  dependsOn: ['permission_check'],
  async run(ctx: SecurityContext): Promise<SecurityCheckRunResult> {
    const { organizationId, client } = ctx
    try {
      const resp = (await client.raw.get(
        `/organizations/${organizationId}/audit_logging/configurations`,
        { headers: { 'x-contentful-enable-alpha-feature': 'audit-logging' } }
      )) as AuditLoggingResponseAxiosLike
      const items = extractItems(resp)
      const count = items.length
      return {
        pass: count > 0,
        data: { itemCount: count }
      }
    } catch (_) {
      return {
        pass: false,
        data: { error: 'fetch_failed' }
      }
    }
  }
}

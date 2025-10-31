import type {
  SecurityCheck,
  SecurityContext,
  SecurityCheckRunResult
} from './types'

interface SecurityContactsCollectionShape {
  total?: number
  items?: unknown[]
}
interface SecurityContactsResponseAxiosLike {
  data?: SecurityContactsCollectionShape
  total?: number
  items?: unknown[]
}

function extractTotal(
  resp: SecurityContactsResponseAxiosLike
): number | undefined {
  return resp?.data?.total ?? resp?.total
}
function extractItems(resp: SecurityContactsResponseAxiosLike): unknown[] {
  return resp?.data?.items || resp?.items || []
}

export const securityContactSetCheck: SecurityCheck = {
  id: 'security_contact_set',
  description: 'Security contact is configured for the organization',
  dependsOn: ['permission_check'],
  async run(ctx: SecurityContext): Promise<SecurityCheckRunResult> {
    const { client, organizationId } = ctx
    try {
      const resp = (await client.raw.get(
        `/organizations/${organizationId}/security_contacts`
      )) as SecurityContactsResponseAxiosLike
      const total = extractTotal(resp)
      const items = extractItems(resp)
      const count = typeof total === 'number' ? total : items.length
      return {
        pass: count > 0,
        data: { contactCount: count }
      }
    } catch (_) {
      return {
        pass: false,
        data: { error: 'fetch_failed' }
      }
    }
  }
}

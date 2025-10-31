import { SecurityCheck, SecurityContext } from './types'

interface IdentityProviderResponse {
  data?: { enabled?: boolean }
  enabled?: boolean
}

export const ssoEnabledCheck: SecurityCheck = {
  id: 'sso_enabled',
  description: 'SSO is enabled for the organization',
  dependsOn: ['permission_check'],
  async run(ctx: SecurityContext): Promise<boolean> {
    try {
      const resp = (await ctx.client.raw.get(
        `/organizations/${ctx.organizationId}/identity_provider`
      )) as IdentityProviderResponse
      const enabled = resp?.data?.enabled ?? resp?.enabled
      return !!enabled
    } catch (_) {
      return false
    }
  }
}

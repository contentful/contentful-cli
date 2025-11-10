import { SecurityCheck, SecurityContext } from './types'

interface IdentityProviderResponse {
  data?: { restricted?: boolean }
  restricted?: boolean
}

export const ssoEnforcedCheck: SecurityCheck = {
  id: 'sso_enforced',
  description: 'SSO is enforced (restricted) for the organization',
  dependsOn: ['permission_check', 'sso_enabled'],
  async run(ctx: SecurityContext): Promise<boolean> {
    try {
      const resp = (await ctx.client.raw.get(
        `/organizations/${ctx.organizationId}/identity_provider`
      )) as IdentityProviderResponse
      const restricted = resp?.data?.restricted ?? resp?.restricted
      // Pass only if restricted === true (enforced). restricted:false => fail.
      return !!restricted
    } catch (_) {
      return false
    }
  }
}

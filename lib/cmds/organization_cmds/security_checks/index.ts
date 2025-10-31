import { permissionCheck } from './permission'
import { ssoEnabledCheck } from './sso_enabled'
import { ssoEnforcedCheck } from './sso_enforced'
import { ssoExemptUsersCheck } from './sso_exempt_users'
import { ssoExemptUsersWithMfaDisabledCheck } from './sso_exempt_users_with_mfa_disabled'
import { securityContactSetCheck } from './security_contact_set'
import { auditLoggingConfiguredCheck } from './audit_logging_configured'
import { activeTokensWithoutExpiryCheck } from './active_tokens_without_expiry'
import type { SecurityCheck } from './types'

export const checks: SecurityCheck[] = [
  permissionCheck,
  securityContactSetCheck,
  auditLoggingConfiguredCheck,
  activeTokensWithoutExpiryCheck,
  ssoEnabledCheck,
  ssoEnforcedCheck,
  ssoExemptUsersCheck,
  ssoExemptUsersWithMfaDisabledCheck
]

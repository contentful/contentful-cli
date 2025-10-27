import { permissionCheck } from './permission'
import { ssoEnabledCheck } from './sso_enabled'
import { ssoEnforcedCheck } from './sso_enforced'
import { ssoExemptUsersCheck } from './sso_exempt_users'
import { ssoExemptUsersWithMfaDisabledCheck } from './sso_exempt_users_with_mfa_disabled'
import type { SecurityCheck } from './types'

export const checks: SecurityCheck[] = [
  permissionCheck,
  ssoEnabledCheck,
  ssoEnforcedCheck,
  ssoExemptUsersCheck,
  ssoExemptUsersWithMfaDisabledCheck
]

import { permissionCheck } from './permission'
import { ssoEnabledCheck } from './sso_enabled'
import { ssoEnforcedCheck } from './sso_enforced'
import { ssoExemptUsersCheck } from './sso_exempt_users'
import type { SecurityCheck } from './types'

export const checks: SecurityCheck[] = [
  permissionCheck,
  ssoEnabledCheck,
  ssoEnforcedCheck,
  ssoExemptUsersCheck
]

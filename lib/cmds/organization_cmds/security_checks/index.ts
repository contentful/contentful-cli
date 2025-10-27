import { permissionCheck } from './permission'
import { ssoEnabledCheck } from './sso_enabled'
import { ssoEnforcedCheck } from './sso_enforced'
import type { SecurityCheck } from './types'

export const checks: SecurityCheck[] = [
  permissionCheck,
  ssoEnabledCheck,
  ssoEnforcedCheck
]

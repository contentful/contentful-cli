import { permissionCheck } from './permission'
import { ssoEnabledCheck } from './sso_enabled'
import type { SecurityCheck } from './types'

export const checks: SecurityCheck[] = [permissionCheck, ssoEnabledCheck]

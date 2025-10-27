import { permissionCheck } from './permission'
import { ssoEnabledCheck } from './sso'
import type { SecurityCheck } from './types'

export const checks: SecurityCheck[] = [permissionCheck, ssoEnabledCheck]

import { SecurityCheck, SecurityContext } from './types'

export const permissionCheck: SecurityCheck = {
  id: 'permission_check',
  description: 'User has owner or admin role in the organization',
  async run(ctx: SecurityContext): Promise<boolean> {
    return !!ctx.role && ['owner', 'admin'].includes(ctx.role)
  }
}


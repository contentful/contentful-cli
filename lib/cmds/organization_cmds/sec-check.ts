import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { getHeadersFromOption } from '../../utils/headers'
import { log } from '../../utils/log'
import { checks } from './security_checks'
import type { SecurityContext } from './security_checks/types'

module.exports.command = 'sec-check'

module.exports.desc =
  'Check if current user has owner or admin role in a Contentful organization'

interface Params {
  context?: { managementToken?: string }
  header?: string
  'organization-id': string
  'management-token'?: string
}

interface MembershipItem {
  role: string
  user?: { sys?: { id: string } }
}
interface MembershipResponseShape {
  items?: MembershipItem[]
}
interface MembershipAxiosLike {
  data?: MembershipResponseShape
  items?: MembershipItem[]
}
interface UserShapeSys {
  sys?: { id?: string }
  id?: string
}
interface UserAxiosLike {
  data?: UserShapeSys
  sys?: { id?: string }
  id?: string
}
interface RawGetOptions {
  params?: Record<string, string | number | boolean | undefined>
}
interface PlainClient {
  raw: {
    get: (path: string, opts?: RawGetOptions) => Promise<unknown>
  }
}

function extractUserId(user: UserAxiosLike): string | null {
  return user?.data?.sys?.id || user?.sys?.id || user?.id || null
}

function extractMembershipItems(resp: MembershipAxiosLike): MembershipItem[] {
  return resp?.data?.items || resp?.items || []
}

module.exports.builder = function (yargs: Argv) {
  return yargs
    .usage(
      'Usage: contentful organization sec-check --organization-id <organization_id>'
    )
    .option('organization-id', {
      alias: 'oid',
      describe: 'Contentful organization ID',
      type: 'string',
      demandOption: true
    })
    .option('management-token', {
      alias: 'mt',
      describe:
        'Contentful management API token (overrides stored context token)',
      type: 'string'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
}

async function securityCheck(argv: Params) {
  const { context, header } = argv
  const organizationId = argv['organization-id']
  const passedToken = argv['management-token']
  const managementToken = passedToken || (context && context.managementToken)

  const results: Record<
    string,
    { description: string; pass: boolean; skipped?: boolean; reason?: string }
  > = {}

  const outputResults = () => {
    // Pretty-print JSON for readability
    log(JSON.stringify(results, null, 2))
  }

  if (!managementToken) {
    for (const c of checks) {
      results[c.id] = {
        description: c.description,
        pass: false,
        reason: 'missing_token'
      }
    }
    outputResults()
    process.exit(1)
    return
  }

  const client = (await createPlainClient({
    accessToken: managementToken,
    feature: 'organization-sec-check',
    headers: getHeadersFromOption(header)
  })) as PlainClient

  let userId: string | null = null
  try {
    const user = (await client.raw.get('/users/me')) as UserAxiosLike
    userId = extractUserId(user)
  } catch (_) {
    for (const c of checks) {
      results[c.id] = {
        description: c.description,
        pass: false,
        reason: 'user_fetch_failed'
      }
    }
    outputResults()
    process.exit(1)
    return
  }

  if (!userId) {
    for (const c of checks) {
      results[c.id] = {
        description: c.description,
        pass: false,
        reason: 'user_missing'
      }
    }
    outputResults()
    process.exit(1)
    return
  }

  let role: string | undefined
  try {
    const membershipResp = (await client.raw.get(
      `/organizations/${organizationId}/organization_memberships`,
      { params: { query: userId } }
    )) as MembershipAxiosLike
    const items = extractMembershipItems(membershipResp)
    const membership =
      items.find(m => m?.user?.sys?.id === userId) || items[0] || null
    role = membership?.role
  } catch (_) {
    // ignore
  }

  const ctx: SecurityContext = { client, organizationId, userId, role }

  const passed: Record<string, boolean> = {}

  // Find the permission_check explicitly (don't rely on ordering)
  const permissionCheck = checks.find(c => c.id === 'permission_check')
  if (permissionCheck) {
    results[permissionCheck.id] = {
      description: permissionCheck.description,
      pass: false
    }
    try {
      const ok = await permissionCheck.run(ctx)
      results[permissionCheck.id].pass = ok
      passed[permissionCheck.id] = ok
      if (!ok) {
        // Exit early without running any other checks
        outputResults()
        process.exit(1)
        return
      }
    } catch (_) {
      results[permissionCheck.id].reason = 'error'
      passed[permissionCheck.id] = false
      outputResults()
      process.exit(1)
      return
    }
  }

  // Run remaining checks (excluding permission_check which already ran)
  for (const check of checks) {
    if (check.id === 'permission_check') continue

    results[check.id] = {
      description: check.description,
      pass: false
    }

    if (check.dependsOn && check.dependsOn.some(d => !passed[d])) {
      results[check.id].skipped = true
      results[check.id].reason = 'dependency_failed'
      continue
    }

    try {
      const ok = await check.run(ctx)
      results[check.id].pass = ok
      passed[check.id] = ok
    } catch (_) {
      results[check.id].reason = 'error'
      passed[check.id] = false
    }
  }

  outputResults()
  if (!passed['permission_check']) {
    process.exit(1)
  }
}

module.exports.securityCheck = securityCheck

module.exports.handler = handle(securityCheck)

import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { getHeadersFromOption } from '../../utils/headers'
import { log } from '../../utils/log'
import { checks } from './security_checks'
import type { SecurityContext, PlainClient } from './security_checks/types'
import * as fs from 'fs'
import * as path from 'path'
// Lazy require listr only when needed (esm/cjs interop)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Listr = require('listr')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Table = require('cli-table3')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk')

module.exports.command = 'sec-check'

module.exports.desc =
  'Check if current user has owner or admin role in a Contentful organization'

interface Params {
  context?: { managementToken?: string }
  header?: string
  'organization-id': string
  'management-token'?: string
  'output-file'?: string
}


interface CheckResult {
  description: string
  pass: boolean
  skipped?: boolean
  reason?: string
  data?: Record<string, unknown>
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
    .option('output-file', {
      alias: 'o',
      type: 'string',
      describe:
        'Write JSON results to a file. If used without a filename, a default file ./data/<timestamp>-<org-id>-sec-check.json is created.'
    })
}

function buildDefaultOutputPath(orgId: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const safeOrg = (orgId || 'org').replace(/[^A-Za-z0-9_-]/g, '_')
  return path.join('data', `${ts}-${safeOrg}-sec-check.json`)
}

async function writeResultsFile(filePath: string, results: Record<string, any>) {
  const dir = path.dirname(filePath)
  await fs.promises.mkdir(dir, { recursive: true })
  await fs.promises.writeFile(filePath, JSON.stringify(results, null, 2), 'utf8')
}

async function runInteractiveMode(argv: Params) {
  const { context, header } = argv
  const organizationId = argv['organization-id']
  const passedToken = argv['management-token']
  const rawOutputOpt = (argv['output-file'] as unknown)
  let outputFile: string | undefined
  const managementToken = passedToken || (context && context.managementToken)

  // Resolve output file behavior:
  // - If -o (no filename) provided -> use generated timestamped path under ./data
  // - If -o foo.json (or any name/path) provided -> place (basename) under ./data directory
  if (rawOutputOpt !== undefined) {
    if (rawOutputOpt === true || rawOutputOpt === '' || rawOutputOpt === null) {
      outputFile = buildDefaultOutputPath(organizationId)
    } else if (typeof rawOutputOpt === 'string') {
      const base = path.basename(rawOutputOpt)
      outputFile = path.join('data', base)
    }
  }

  const results: Record<string, CheckResult> = {}
  const passed: Record<string, boolean> = {}
  let client: PlainClient | null = null
  let userId: string | null = null
  let role: string | undefined

  const tasks = new Listr(
    [
      {
        title: 'Validating management token',
        task: () => {
          if (!managementToken) throw new Error('Missing management token')
        }
      },
      {
        title: 'Creating API client',
        task: async () => {
          client = (await createPlainClient({
            accessToken: managementToken as string,
            feature: 'organization-sec-check',
            headers: getHeadersFromOption(header)
          })) as PlainClient
        }
      },
      {
        title: 'Fetching user information',
        task: async () => {
          if (!client) throw new Error('Client not initialized')
          try {
            const user = (await client.raw.get('/users/me')) as any
            userId = user?.data?.sys?.id || user?.sys?.id || user?.id || null
            if (!userId) throw new Error('Unable to determine user ID')
          } catch (e) {
            throw new Error('Unable to determine user ID')
          }
        }
      },
      {
        title: 'Fetching user role in organization',
        task: async () => {
          if (!client || !userId) throw new Error('Prerequisites not met')
          try {
            const membershipResp = (await client.raw.get(
              `/organizations/${organizationId}/organization_memberships`,
              { params: { query: userId } }
            )) as any
            const items = membershipResp?.data?.items || membershipResp?.items || []
            const membership =
              items.find((m: any) => m?.user?.sys?.id === userId) || items[0] || null
            role = membership?.role
          } catch (_) {
            // ignore; role can be undefined
          }
        }
      },
      {
        title: 'Checking user permissions',
        task: async (_ctx: any, task: any) => {
          const permissionCheck = checks.find(c => c.id === 'permission_check')
          if (!permissionCheck) return
          if (!client || !userId) throw new Error('Missing user context')
          const secCtx: SecurityContext = { client, organizationId, userId, role }
          const res = await permissionCheck.run(secCtx)
          const ok = typeof res === 'boolean' ? res : res.pass
            ; (results as any)[permissionCheck.id] = { description: permissionCheck.description, pass: ok }
          if (typeof res !== 'boolean' && res.data) (results as any)[permissionCheck.id].data = res.data
          passed[permissionCheck.id] = ok
          task.title = `Checking user permissions`
          if (!ok) throw new Error('Insufficient permissions')
        }
      },
      {
        title: 'Running security checks',
        task: () => {
          if (!client || !userId) throw new Error('Missing context for checks')
          const secCtx: SecurityContext = { client, organizationId, userId, role }
          return new Listr(
            checks
              .filter(c => c.id !== 'permission_check')
              .map(check => ({
                title: check.description,
                task: async (_c: any, task: any) => {
                  if (check.dependsOn && check.dependsOn.some(d => !passed[d])) {
                    (results as any)[check.id] = {
                      description: check.description,
                      pass: false,
                      skipped: true,
                      reason: 'dependency_failed'
                    }
                    task.skip('dependency_failed')
                    return
                  }
                  try {
                    const res = await check.run(secCtx)
                    const ok = typeof res === 'boolean' ? res : res.pass
                    ; (results as any)[check.id] = { description: check.description, pass: ok }
                    if (typeof res !== 'boolean' && res.data) (results as any)[check.id].data = res.data
                    passed[check.id] = ok
                    task.title = `${check.description} - ${ok ? 'PASS' : 'FAIL'}`
                  } catch (_) {
                    (results as any)[check.id] = { description: check.description, pass: false, reason: 'error' }
                    task.title = `${check.description} - ERROR`
                  }
                }
              }))
          )
        }
      }
    ],
    { concurrent: false }
  )

  let taskError: Error | null = null
  try {
    await tasks.run()
  } catch (e: any) {
    taskError = e
  }

  // Build ordered results object (suppressed JSON stdout per request)
  const ordered: Record<string, CheckResult> = {}
  for (const c of checks) {
    if (results[c.id]) ordered[c.id] = results[c.id]
  }

  // Optionally write file
  if (outputFile) {
    try {
      await writeResultsFile(outputFile, ordered)
      const mark = chalk ? chalk.green('✔') : '✔'
      log(`${mark} Output written: ${outputFile}`)
    } catch (err: any) {
      log(`Failed to write results file: ${err.message}`)
    }
  }

  // Render table (re-using ordered data)
  const headers = ['Check ID', 'Description', 'Status', 'Details']
  const colWidthId = 40
  const colWidthDesc = 70
  const colWidthStatus = 10
  const colWidthDetails = 35
  const table = new Table({
    head: headers.map(h => chalk.bold.cyan(h)),
    wordWrap: true,
    colWidths: [colWidthId, colWidthDesc, colWidthStatus, colWidthDetails],
    style: { head: [], border: [] }
  })
  const truncate = (str: string, max: number) => (str.length > max ? str.slice(0, max - 1) + '…' : str)
  const formatDetails = (cId: string, r: CheckResult): string => {
    if (r.skipped && r.reason === 'dependency_failed') return '{"skipped":"dependency_failed"}'
    if (r.reason === 'error') return '{"error":true}'
    if (r.data && Object.keys(r.data).length > 0) return truncate(JSON.stringify(r.data), colWidthDetails - 2)
    if (cId === 'permission_check' && role) return truncate(JSON.stringify({ role }), colWidthDetails - 2)
    return ''
  }
  for (const c of checks) {
    const r = ordered[c.id]
    if (!r) continue
    const statusRaw = r.skipped ? 'SKIPPED' : r.pass ? 'PASS' : 'FAIL'
    const statusColored = r.skipped ? chalk.yellow(statusRaw) : r.pass ? chalk.green(statusRaw) : chalk.red(statusRaw)
    const detail = formatDetails(c.id, r)
    const descCell = truncate(r.description, colWidthDesc - 2)
    const idCell = truncate(c.id, colWidthId - 2)
    table.push([idCell, descCell, statusColored, detail])
  }
  log('\n' + table.toString())

  // Determine exit code: if permission_check failed OR task error occurred
  if (taskError || !passed['permission_check']) {
    process.exit(1)
  }
}

async function securityCheck(argv: Params) {
  // Always use interactive mode now (Listr), with optional file output
  return runInteractiveMode(argv)
}

module.exports.securityCheck = securityCheck
module.exports.handler = handle(securityCheck)

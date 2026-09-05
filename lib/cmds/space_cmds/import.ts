import runContentfulImport from 'contentful-import'
import { handleAsyncError as handle } from '../../utils/async'
import {
  createCmaBulkTransport,
  importEntriesWithBulkOperations,
  SourceEntry
} from '../../utils/bulk-entry-import'
import { createPlainClient } from '../../utils/contentful-clients'
import { copyright } from '../../utils/copyright'
import { getPath, readFileP } from '../../utils/fs'
import { getHeadersFromOption } from '../../utils/headers'
import { warning } from '../../utils/log'
import { proxyObjectToString } from '../../utils/proxy'
import { version } from '../../../package.json'
import { Argv } from 'yargs'

export const command = 'import'

export const desc = 'import a space'

export const builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful space import --content-file <file>')
    .option('space-id', {
      describe: 'ID of the destination space',
      type: 'string'
    })
    .option('environment-id', {
      describe: 'ID the environment in the destination space',
      type: 'string',
      demand: false
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('content-file', {
      describe: 'JSON file that contains data to import into a space',
      type: 'string',
      demand: true
    })
    .option('content-model-only', {
      describe: 'Import only content types',
      type: 'boolean',
      default: false
    })
    .option('skip-content-model', {
      describe: 'Skip importing content types and locales',
      type: 'boolean',
      default: false
    })
    .option('skip-locales', {
      describe: 'Skip importing locales',
      type: 'boolean',
      default: false
    })
    .option('skip-content-publishing', {
      describe:
        'Skips content publishing. Creates content but does not publish it',
      type: 'boolean',
      default: false
    })
    .option('use-bulk-entries', {
      describe:
        'Import entries via Bulk Entry Operations (create/update, up to 10k per job) and Bulk Actions for publish. Requires Bulk Content Operations (Premium). Content model, locales, tags and assets still use the classic importer.',
      type: 'boolean',
      default: false
    })
    .option('skip-content-updates', {
      describe: 'Skips updating existing content, only creates new entries.',
      type: 'boolean',
      default: false
    })
    .option('skip-asset-updates', {
      describe: 'Skips updating existing assets, only creates new assets.',
      type: 'boolean',
      default: false
    })
    .option('include-experience-orchestration', {
      describe:
        'Import Experience Orchestration entities (designTokens, components, experienceTemplates, experienceFragments, dataAssemblies, experiences). Requires a space with ExO enabled.',
      type: 'boolean',
      default: true
    })
    .option('update', {
      describe: 'Update entries if they already exist',
      type: 'boolean',
      hidden: true
    })
    .option('error-log-file', {
      describe: 'Full path to the error log file',
      type: 'string'
    })
    .option('host', {
      describe: 'Management API host',
      type: 'string'
    })
    .option('proxy', {
      describe:
        'Proxy configuration in HTTP auth format: [http|https]://host:port or [http|https]://user:password@host:port',
      type: 'string'
    })
    .option('timeout', {
      describe: 'Timeout in milliseconds for API calls',
      type: 'number',
      default: 20000
    })
    .option('retry-limit', {
      describe: 'How many times to retry before an operation fails',
      type: 'number',
      default: 10
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .option('upload-assets', {
      describe:
        'Upload local asset files downloaded via the --downloadAssets option of the export. Requires `assetsDirectory`',
      type: 'boolean',
      default: false
    })
    .option('assets-directory', {
      describe:
        'Path to a directory with an asset export made using the --downloadAssets option of the export. Requires `uploadAssets`',
      type: 'string'
    })
    .config(
      'config',
      'An optional configuration JSON file containing all the options for a single run'
    )
    .epilog(copyright)
}

interface ProxyObject {
  host: string
  port: number
  auth: { username: string; password: string }
  isHttps: boolean
}

interface Context {
  managementToken?: string
  activeSpaceId?: string
  activeEnvironmentId?: string
  host?: string
  proxy?: string | ProxyObject
  rawProxy?: string
}

interface ImportContent {
  entries?: SourceEntry[]
  [key: string]: unknown
}

interface ImportSpaceProps {
  context: Context
  feature?: string
  update?: never
  header?: string
  proxy?: string
  content?: ImportContent
  contentFile?: string
  contentModelOnly?: boolean
  skipContentPublishing?: boolean
  skipContentUpdates?: boolean
  useBulkEntries?: boolean
  uploadAssets?: string
  assetsDirectory?: string
  includeExperienceOrchestration?: boolean
}

interface Options {
  spaceId?: string
  environmentId?: string
  managementApplication: string
  managementFeature: string
  managementToken?: string
  host?: string
  headers: Record<string, string>
  proxy?: string
  rawProxy?: string
  uploadAssets?: string
  assetsDirectory?: string
  includeExperienceOrchestration?: boolean
  content?: ImportContent
  contentFile?: string
}

async function loadImportContent(
  argv: ImportSpaceProps
): Promise<ImportContent> {
  if (argv.content) {
    return argv.content
  }

  if (!argv.contentFile) {
    throw new Error('The --content-file option is required.')
  }

  const raw = await readFileP(getPath(argv.contentFile), 'utf8')
  return JSON.parse(raw as string)
}

export const importSpace = async (argv: ImportSpaceProps) => {
  if (argv.update !== undefined) {
    warning('The --update option has been deprecated and will be ignored.')
  }

  const {
    context,
    feature = 'space-import',
    uploadAssets,
    assetsDirectory,
    includeExperienceOrchestration,
    useBulkEntries,
    contentModelOnly,
    skipContentPublishing,
    skipContentUpdates
  } = argv
  const {
    managementToken,
    activeSpaceId,
    activeEnvironmentId,
    host,
    proxy,
    rawProxy
  } = context

  if (uploadAssets && !assetsDirectory) {
    throw new Error(
      'The --upload-assets option requires the --assets-directory option to be set.'
    )
  }

  const options: Options = {
    ...argv,
    spaceId: activeSpaceId,
    environmentId: activeEnvironmentId,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: feature,
    managementToken,
    host,
    headers: getHeadersFromOption(argv.header),
    uploadAssets,
    assetsDirectory,
    includeExperienceOrchestration
  }
  delete (options as Options & { useBulkEntries?: boolean }).useBulkEntries

  if (proxy) {
    // contentful-import and contentful-export
    // expect a string for the proxy config
    // and create agents from it
    if (typeof proxy !== 'string') {
      options.proxy = proxyObjectToString(proxy)
    } else {
      options.proxy = proxy
    }

    options.rawProxy = rawProxy
  }

  const shouldUseBulkEntries = Boolean(useBulkEntries) && !contentModelOnly

  if (!shouldUseBulkEntries) {
    return runContentfulImport(options)
  }

  if (!activeSpaceId) {
    throw new Error('A destination space ID is required for bulk entry import.')
  }

  const source = await loadImportContent(argv)
  const entries = Array.isArray(source.entries) ? source.entries : []
  const contentWithoutEntries = { ...source, entries: [] }

  const importResult = await runContentfulImport({
    ...options,
    content: contentWithoutEntries,
    contentFile: undefined
  })

  if (entries.length === 0) {
    return importResult
  }

  const environmentId = activeEnvironmentId || 'master'
  const client = await createPlainClient(
    {
      accessToken: managementToken,
      feature,
      headers: getHeadersFromOption(argv.header),
      host
    },
    {
      spaceId: activeSpaceId,
      environmentId
    }
  )

  await importEntriesWithBulkOperations({
    entries,
    skipContentPublishing,
    skipContentUpdates,
    transport: createCmaBulkTransport({
      client,
      spaceId: activeSpaceId,
      environmentId
    })
  })

  return importResult
}

export const handler = handle(importSpace)

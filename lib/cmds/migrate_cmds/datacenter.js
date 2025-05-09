const path = require('path')
const fs = require('fs')
const os = require('os')
const runContentfulExport = require('contentful-export')
const runContentfulImport = require('contentful-import')
const { handleAsyncError: handle } = require('../../utils/async')
const { version } = require('../../../package.json')
const logging = require('../../utils/log')
const { getHeadersFromOption } = require('../../utils/headers')
const emojic = require('emojic')

const HOST_MAP = {
  eu: 'api.eu.contentful.com',
  na: 'api.contentful.com'
}

const ensureDirExists = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const migrateDataCenter = async argv => {
  const {
    source,
    target,
    sourceSpaceId,
    targetSpaceId,
    sourceToken,
    targetToken,
    environmentId,
    useVerboseRenderer
  } = argv

  const exportDir = path.join(process.cwd(), 'tmp-export')
  ensureDirExists(exportDir)

  const contentFile = path.join(
    exportDir,
    `contentful-export-${sourceSpaceId}-${environmentId}-${Date.now()}.json`
  )

  // Step 1: Export
  console.log(`🚚 Exporting contentful data from [${source}]...`)
  await runContentfulExport({
    spaceId: sourceSpaceId,
    environmentId,
    managementToken: sourceToken,
    host: HOST_MAP[source],
    contentFile,
    saveFile: true,
    useVerboseRenderer,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'migrate-datacenter',
    headers: getHeadersFromOption(argv.header)
  })

  logging.success(`${emojic.whiteCheckMark} Export complete`)

  // Step 2: Import
  console.log(`${emojic.inboxTray} Importing content into [${target}]...`)
  await runContentfulImport({
    spaceId: targetSpaceId,
    environmentId,
    managementToken: targetToken,
    host: HOST_MAP[target],
    contentFile,
    useVerboseRenderer,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'migrate-datacenter',
    headers: getHeadersFromOption(argv.header)
  })

  logging.success(`${emojic.tada} Migration complete!`)
}

module.exports.command = 'datacenter'
module.exports.desc = 'Migrate a space between Contentful data centers'
module.exports.builder = yargs =>
  yargs
    .option('source', {
      describe: 'Source data center (na or eu)',
      choices: ['na', 'eu'],
      demandOption: true
    })
    .option('target', {
      describe: 'Target data center (na or eu)',
      choices: ['na', 'eu'],
      demandOption: true
    })
    .option('source-space-id', {
      describe: 'Source space ID',
      type: 'string',
      demandOption: true
    })
    .option('target-space-id', {
      describe: 'Target space ID',
      type: 'string',
      demandOption: true
    })
    .option('environment-id', {
      describe: 'Environment ID (e.g. master)',
      type: 'string',
      default: 'master'
    })
    .option('source-token', {
      describe: 'Source CMA token',
      type: 'string',
      demandOption: true
    })
    .option('target-token', {
      describe: 'Target CMA token',
      type: 'string',
      demandOption: true
    })
    .option('use-verbose-renderer', {
      describe: 'Display progress in new lines instead of spinner',
      type: 'boolean',
      default: false
    })

module.exports.handler = handle(migrateDataCenter)

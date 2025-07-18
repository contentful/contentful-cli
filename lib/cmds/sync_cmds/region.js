const path = require('path')
const fs = require('fs')
const os = require('os')
const runContentfulExport = require('contentful-export')
const runContentfulImport = require('contentful-import')
const { handleAsyncError: handle } = require('../../utils/async')
const { version } = require('../../../package.json')
const logging = require('../../utils/log')
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

const migrateRegion = async argv => {
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

  if (argv.includeTaxonomies) {
    if (!argv.sourceOrgId || !argv.targetOrgId) {
      throw new Error(
        '--source-org-id and --target-org-id are required when --include-taxonomies is set'
      )
    }

    const taxonomyFile = path.join(
      exportDir,
      `taxonomy-${argv.sourceOrgId}-${Date.now()}.json`
    )

    console.log(
      `Exporting taxonomies from source organization ${argv.sourceOrgId}...`
    )

    const { organizationExport } = require('../organization_cmds/export')

    await organizationExport({
      context: { managementToken: argv.sourceToken },
      organizationId: argv.sourceOrgId,
      outputFile: taxonomyFile,
      saveFile: true,
      host: HOST_MAP[target]
    })

    logging.success(`${emojic.whiteCheckMark} Taxonomy export complete`)

    console.log(
      `${emojic.inboxTray} Importing taxonomies into target organization ${argv.targetOrgId}...`
    )

    const { organizationImport } = require('../organization_cmds/import')

    await organizationImport({
      context: { managementToken: argv.targetToken },
      organizationId: argv.targetOrgId,
      contentFile: taxonomyFile,
      silent: !argv.useVerboseRenderer,
      host: HOST_MAP[target]
    })

    logging.success(`${emojic.whiteCheckMark} Taxonomy import complete`)
  }

  const contentFile = path.join(
    exportDir,
    `contentful-export-${sourceSpaceId}-${environmentId}-${Date.now()}.json`
  )

  console.log(`🚚 Exporting contentful data from [${source} region]...`)
  await runContentfulExport({
    spaceId: sourceSpaceId,
    environmentId,
    managementToken: sourceToken,
    host: HOST_MAP[source],
    contentFile,
    saveFile: true,
    useVerboseRenderer,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'migrate-region'
  })

  logging.success(`${emojic.whiteCheckMark} Export complete`)

  console.log(
    `${emojic.inboxTray} Importing content into [${target} region]...`
  )
  await runContentfulImport({
    spaceId: targetSpaceId,
    environmentId,
    managementToken: targetToken,
    host: HOST_MAP[target],
    contentFile,
    useVerboseRenderer,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'migrate-region',
    skipContentPublishing: argv.skipContentPublishing
  })

  logging.success(`${emojic.tada} Migration complete!`)
}

module.exports.command = 'region'
module.exports.desc = 'Migrate a space between Contentful regions'
module.exports.builder = yargs =>
  yargs
    .option('source-region', {
      alias: 'source',
      describe: 'Source region (na or eu)',
      choices: ['na', 'eu'],
      demandOption: true
    })
    .option('target-region', {
      alias: 'target',
      describe: 'Target region (na or eu)',
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
    .option('include-taxonomies', {
      describe:
        'Migrate taxonomies (Concepts & Concept Schemes) before importing content',
      type: 'boolean',
      default: false
    })
    .option('source-org-id', {
      describe: 'Organization ID where taxonomies should be exported from',
      type: 'string'
    })
    .option('target-org-id', {
      describe: 'Organization ID where taxonomies should be imported to',
      type: 'string'
    })
    .option('skip-content-publishing', {
      describe:
        'Skips content publishing. Creates content but does not publish it',
      type: 'boolean',
      default: true
    })

module.exports.handler = handle(migrateRegion)
module.exports.migrateRegion = migrateRegion

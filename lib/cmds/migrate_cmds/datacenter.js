const { handleAsyncError: handle } = require('../../utils/async')
const { success } = require('../../utils/log')
const { successEmoji } = require('../../utils/emojis')
const path = require('path')
const fs = require('fs')

const { exportSpace } = require('../space_cmds/export')
const { importSpace } = require('../space_cmds/import')

module.exports.command = 'datacenter'
module.exports.desc = 'Migrate content between NA and EU data centers'

module.exports.builder = yargs => {
  return yargs
    .usage(
      'Usage: contentful migrate datacenter --source na --target eu --source-space-id xxx --target-space-id yyy --environment-id master --source-token aaa --target-token bbb'
    )
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
      describe: 'Source space ID in the source region',
      type: 'string',
      demandOption: true
    })
    .option('target-space-id', {
      describe: 'Target space ID in the target region',
      type: 'string',
      demandOption: true
    })
    .option('environment-id', {
      describe: 'Environment ID (e.g., master)',
      type: 'string',
      default: 'master'
    })
    .option('source-token', {
      describe: 'CMA token for source space',
      type: 'string',
      demandOption: true
    })
    .option('target-token', {
      describe: 'CMA token for target space',
      type: 'string',
      demandOption: true
    })
}

const datacenterHandler = async argv => {
  const {
    source,
    target,
    sourceSpaceId,
    targetSpaceId,
    environmentId,
    sourceToken,
    targetToken
  } = argv

  const exportDir = path.join(process.cwd(), 'tmp-export')
  const exportFilePath = path.join(exportDir, 'export.json')
  const errorLogFile = path.join(exportDir, 'error-log.json')

  fs.mkdirSync(exportDir, { recursive: true })

  const sourceHost =
    source === 'eu' ? 'api.eu.contentful.com' : 'api.contentful.com'
  const targetHost =
    target === 'eu' ? 'api.eu.contentful.com' : 'api.contentful.com'

  console.log(`Exporting content from ${sourceHost}...`)
  await exportSpace({
    spaceId: sourceSpaceId,
    environmentId,
    managementToken: sourceToken,
    host: sourceHost,
    exportDir,
    contentFile: exportFilePath,
    errorLogFile,
    saveFile: true,
    skipWebhooks: true,
    skipContentModel: false,
    skipLocales: false,
    context: {
      managementToken: sourceToken,
      activeSpaceId: sourceSpaceId,
      activeEnvironmentId: environmentId,
      host: sourceHost
    }
  })

  console.log(`Importing content to ${targetHost}...`)
  await importSpace({
    contentFile: exportFilePath,
    context: {
      managementToken: targetToken,
      activeSpaceId: targetSpaceId,
      activeEnvironmentId: environmentId,
      host: targetHost
    }
  })

  success(
    `${successEmoji} Migration complete from ${source.toUpperCase()} to ${target.toUpperCase()}`
  )

  try {
    fs.rmSync(exportDir, { recursive: true, force: true })
    console.log('Temporary export files cleaned up')
  } catch (e) {
    console.warn('Failed to delete temp export files:', e.message)
  }
}

module.exports.handler = handle(datacenterHandler)

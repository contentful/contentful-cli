import type { Argv } from 'yargs'

module.exports.command = 'export'

module.exports.desc = 'Export diff between two environments as a migration'

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful merge export')
    .option('source-environment-id', {
      alias: 's',
      type: 'string',
      demand: true,
      describe: 'Source environment id'
    })
    .option('target-environment-id', {
      alias: 't',
      type: 'string',
      demand: true,
      describe: 'Target environment id'
    })
    .option('output-file', {
      alias: 'o',
      type: 'string',
      describe:
        'Output file. It defaults to ./migrations/<timestamp>-<space-id>-<source-environment-id>-<target-environment-id>.js'
    })
}

interface Context {
  managementToken?: string
}

interface ExportMigrationOptions {
  context: Context
  sourceEnvironmentId: string
  targetEnvironmentId: string
  outputFile?: string
}

const exportEnvironmentMigration = ({
  context,
  sourceEnvironmentId,
  targetEnvironmentId
}: ExportMigrationOptions) => {
  console.log('export', context, sourceEnvironmentId, targetEnvironmentId)
}

module.exports.handler = exportEnvironmentMigration

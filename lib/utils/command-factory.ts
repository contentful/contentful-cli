import { copyright } from './copyright'
import { handleAsyncErrorWithExitCode } from './exit-codes'
import { output, OutputFlags, TableConfig, KeyValueConfig } from './output'
import { warning } from './log'
const { createPlainClient } = require('./contentful-clients')
const { getHeadersFromOption } = require('./headers')
const { confirmation } = require('./actions')

export interface CommandConfig {
  /** yargs command string, e.g. 'get <id>' or 'list' */
  command: string
  /** Command description shown in help */
  desc: string
  /** SDK tracking feature string, e.g. 'entry-list' */
  feature: string
  /** Additional yargs options beyond the standard set */
  options?: Record<string, any>
  /** When true, adds --yes flag and prompts for confirmation before executing */
  needsConfirmation?: boolean
  /** Message shown to user when prompting for confirmation */
  confirmationMessage?: string
  /** When true, adds --dry-run flag and routes to dryRunHandler */
  supportsDryRun?: boolean
  /** Usage string shown in help */
  usage?: string
  /** Examples shown in help — array of [command, description] pairs */
  examples?: [string, string][]
  /**
   * Core action handler — receives the plain client and argv.
   * Should return the data to be displayed.
   */
  handler: (client: any, argv: any) => Promise<any>
  /**
   * Optional dry-run handler — called instead of handler when --dry-run is passed.
   * Should return the data to be displayed.
   */
  dryRunHandler?: (client: any, argv: any) => Promise<any>
  /**
   * Optional function that returns a TableConfig or KeyValueConfig for structured output.
   * Receives the handler result data.
   */
  tableFormat?: (data: any) => TableConfig | KeyValueConfig
  /** Optional function that extracts string IDs from result data for --quiet output */
  quietExtractor?: (data: any) => string[]
}

/**
 * Build a complete yargs command object from a declarative CommandConfig.
 * Returns { command, desc, builder, handler } ready to be consumed by yargs.
 *
 * Standard options wired by the builder:
 *   --space-id, --environment-id, --management-token, --header
 *   --json, --agent-mode, --quiet
 *   --yes (when needsConfirmation is true)
 *   --dry-run (when supportsDryRun is true)
 */
export function createCommand(config: CommandConfig): {
  command: string
  desc: string
  builder: (yargs: any) => any
  handler: (argv: any) => Promise<any>
} {
  const builder = (yargs: any): any => {
    if (config.usage) {
      yargs = yargs.usage(config.usage)
    }

    yargs = yargs
      .option('space-id', {
        alias: 's',
        type: 'string',
        describe: 'ID of the space to use'
      })
      .option('environment-id', {
        alias: 'e',
        type: 'string',
        describe: 'ID of the environment to use'
      })
      .option('management-token', {
        alias: 'mt',
        type: 'string',
        describe: 'Contentful management API token'
      })
      .option('header', {
        alias: 'H',
        type: 'string',
        describe: 'Pass an additional HTTP header'
      })
      .option('json', {
        type: 'boolean',
        describe: 'Output as JSON'
      })
      .option('agent-mode', {
        type: 'boolean',
        describe: 'Output in TOON format for agent consumption'
      })
      .option('quiet', {
        alias: 'q',
        type: 'boolean',
        describe: 'Output IDs only (for piping)'
      })

    if (config.needsConfirmation) {
      yargs = yargs.option('yes', {
        alias: 'y',
        type: 'boolean',
        describe: 'Skip confirmation prompt'
      })
    }

    if (config.supportsDryRun) {
      yargs = yargs.option('dry-run', {
        type: 'boolean',
        describe: 'Preview the operation without making changes'
      })
    }

    if (config.options) {
      for (const [name, optionConfig] of Object.entries(config.options)) {
        yargs = yargs.option(name, optionConfig)
      }
    }

    if (config.examples) {
      for (const [cmd, description] of config.examples) {
        yargs = yargs.example(cmd, description)
      }
    }

    yargs = yargs.epilog(copyright)

    return yargs
  }

  const asyncHandler = async (argv: any): Promise<void> => {
    const {
      header,
      json,
      agentMode,
      quiet,
      yes,
      dryRun,
      context: runtimeContext
    } = argv

    // Prefer explicit CLI flags, fall back to runtime context from middleware
    const managementToken =
      argv.managementToken || runtimeContext?.managementToken
    const spaceId = argv.spaceId || runtimeContext?.activeSpaceId
    const environmentId =
      argv.environmentId || runtimeContext?.activeEnvironmentId || 'master'

    // Create plain client with space/environment defaults
    const client = await createPlainClient(
      {
        accessToken: managementToken,
        feature: config.feature,
        headers: getHeadersFromOption(header)
      },
      {
        spaceId,
        environmentId
      }
    )

    // Confirmation prompt if needed
    if (config.needsConfirmation && !yes) {
      const confirmed = await confirmation(
        config.confirmationMessage || 'Are you sure you want to proceed?'
      )
      if (!confirmed) {
        warning('Operation aborted.')
        return
      }
    }

    const flags: OutputFlags = { json, agentMode, quiet }

    let data: any

    if (config.supportsDryRun && dryRun) {
      warning('[DRY RUN] No changes will be made.')
      if (config.dryRunHandler) {
        data = await config.dryRunHandler(client, argv)
      } else {
        data = await config.handler(client, argv)
      }
    } else {
      data = await config.handler(client, argv)
    }

    const outputOpts: {
      quietExtractor?: (data: any) => string[]
      table?: TableConfig
      keyValue?: KeyValueConfig
    } = {}

    if (config.quietExtractor) {
      outputOpts.quietExtractor = config.quietExtractor
    }

    if (config.tableFormat && data !== undefined) {
      const formatted = config.tableFormat(data)
      if ('head' in formatted) {
        outputOpts.table = formatted as TableConfig
      } else {
        outputOpts.keyValue = formatted as KeyValueConfig
      }
    }

    output(data, flags, outputOpts)
  }

  return {
    command: config.command,
    desc: config.desc,
    builder,
    handler: handleAsyncErrorWithExitCode(asyncHandler)
  }
}

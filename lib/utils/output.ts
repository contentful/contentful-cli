import { log } from './log'
import { toTOON } from './toon'
import Table from 'cli-table3'
import type { Argv } from 'yargs'

export interface OutputFlags {
  json?: boolean
  agentMode?: boolean
  quiet?: boolean
}

export type TableRow = string[]
export type KeyValueRow = [string, string]

export interface TableConfig {
  head: string[]
  rows: TableRow[]
}

export interface KeyValueConfig {
  rows: KeyValueRow[]
}

export interface OutputOptions<TData = unknown> {
  quietExtractor?: (data: TData) => string[]
  table?: TableConfig
  keyValue?: KeyValueConfig
}

/**
 * Core output dispatch function.
 * Routes data to the appropriate format based on flags.
 */
export function output<TData>(
  data: TData,
  flags: OutputFlags,
  options: OutputOptions<TData>
): void {
  if (flags.json) {
    log(JSON.stringify(data, null, 2))
    return
  }

  if (flags.agentMode) {
    log(toTOON(data))
    return
  }

  if (flags.quiet && options.quietExtractor) {
    const ids = options.quietExtractor(data)
    ids.forEach(id => log(id))
    return
  }

  if (options.table) {
    const table = new Table({ head: options.table.head })
    options.table.rows.forEach(row => table.push(row))
    log(table.toString())
    return
  }

  if (options.keyValue) {
    const table = new Table()
    options.keyValue.rows.forEach(row => {
      const obj: Record<string, string> = {}
      obj[row[0]] = row[1]
      table.push(obj)
    })
    log(table.toString())
    return
  }

  // Fallback: JSON
  log(JSON.stringify(data, null, 2))
}

/**
 * Extract the value for the first available locale from a localized field object.
 * Contentful fields are shaped as { "en-US": value } or { "nl": value }.
 * Returns undefined if the field is missing or empty.
 */
export function firstLocaleValue<T>(
  field?: Record<string, T> | null
): T | undefined {
  if (!field || typeof field !== 'object') return undefined
  const keys = Object.keys(field)
  return keys.length > 0 ? field[keys[0]] : undefined
}

/**
 * Add standard output flag options to a yargs builder.
 */
export function outputOptions(yargs: Argv): Argv {
  return yargs
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
}

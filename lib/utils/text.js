import Table from 'cli-table2'
import wrapAnsi from 'wrap-ansi'

import { log } from './log'

const maxColumns = process.stdout.columns || 100

export function wrap (text, columns) {
  return wrapAnsi(text, columns || maxColumns)
}

export function frame (text) {
  const table = new Table({
    colWidths: [maxColumns - 2],
    wordWrap: true
  })
  table.push([text])
  log(table.toString())
}

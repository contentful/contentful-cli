import Table from 'cli-table2'
import wrapAnsi from 'wrap-ansi'
import figlet from 'figlet'
import chalk from 'chalk'

const MIN_COLUMNS = 40
const MAX_COLUMNS = process.stdout.columns || 40
export const DEFAULT_COLUMNS = MAX_COLUMNS >= MIN_COLUMNS ? MAX_COLUMNS : MIN_COLUMNS

export function wrap (text, columns) {
  return wrapAnsi(text, columns || DEFAULT_COLUMNS, {
    trim: false
  })
}

export function frame (text, inline = false, wrapText = true) {
  const width = DEFAULT_COLUMNS - 2
  const options = {
    colWidths: [width]
  }

  if (inline) {
    delete options.colWidths
  }

  const table = new Table(options)

  text = text.replace(/\t/g, '  ')

  if (wrapText) {
    text = wrap(text, width)
  }

  table.push([text])
  return table.toString()
}

export function asciiText (text) {
  if (process.stdout.columns <= 78) {
    return chalk.bold(text)
  }
  return figlet.textSync(text)
}

export function separator (customWidth) {
  let width = customWidth || MAX_COLUMNS
  return chalk.dim(Array.from(Array(width + 1)).join('═'))
}

export function indent (text) {
  return `\n${text}`.replace(/\s*[\n\r]\s*/g, '\n    ')
}

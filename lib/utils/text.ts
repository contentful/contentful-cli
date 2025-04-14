import Table from 'cli-table3'
import wrapAnsi from 'wrap-ansi'
import figlet from 'figlet'
import chalk from 'chalk'

const MIN_COLUMNS = 40
const MAX_COLUMNS = process.stdout.columns || 80
const DEFAULT_COLUMNS = MAX_COLUMNS >= MIN_COLUMNS ? MAX_COLUMNS : MIN_COLUMNS

export { DEFAULT_COLUMNS }

export function wrap(text: string, columns?: number): string {
  return wrapAnsi(text, columns || DEFAULT_COLUMNS, {
    trim: false
  })
}

export function frame(text: string, inline = false, wrapText = true): string {
  const width = DEFAULT_COLUMNS - 2
  const options: Table.TableConstructorOptions = {
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

export function asciiText(text: string): string {
  if (process.stdout.columns <= 78) {
    return chalk.bold(text)
  }
  return figlet.textSync(text)
}

export function separator(customWidth?: number): string {
  const width = customWidth || MAX_COLUMNS
  return chalk.dim(Array.from(Array(width + 1)).join('═'))
}

export function indent(text: string): string {
  return `\n${text}`.replace(/\s*[\n\r]\s*/g, '\n    ')
}

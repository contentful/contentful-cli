import Table from 'cli-table2'
import wrapAnsi from 'wrap-ansi'
import figlet from 'figlet'
import chalk from 'chalk'

const minColumns = 40
const maxColumns = process.stdout.columns
const defaultColumns = maxColumns >= minColumns ? maxColumns : minColumns

export function wrap (text, columns) {
  return wrapAnsi(text, columns || defaultColumns)
}

export function frame (text, inline) {
  const options = {
    colWidths: [maxColumns - 2],
    wordWrap: true
  }

  if (inline) {
    delete options.colWidths
  }

  const table = new Table(options)
  table.push([text])
  return table.toString()
}

export function asciiText (text) {
  return figlet.textSync(text)
}

export function separator () {
  return chalk.dim(Array.from(Array(maxColumns + 1)).join('═'))
}

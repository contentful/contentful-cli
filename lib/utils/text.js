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
  const width = maxColumns - 2
  const options = {
    colWidths: [width]
  }

  if (inline) {
    delete options.colWidths
  }

  const table = new Table(options)
  table.push([wrapAnsi(text, width)])
  return table.toString()
}

export function asciiText (text) {
  return figlet.textSync(text)
}

export function separator () {
  return chalk.dim(Array.from(Array(maxColumns + 1)).join('═'))
}

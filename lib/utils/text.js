const Table = require('cli-table3')
const wrapAnsi = require('wrap-ansi')
const figlet = require('figlet')
const chalk = require('chalk')

const MIN_COLUMNS = 40
const MAX_COLUMNS = process.stdout.columns || 80
const DEFAULT_COLUMNS = MAX_COLUMNS >= MIN_COLUMNS ? MAX_COLUMNS : MIN_COLUMNS

module.exports.DEFAULT_COLUMNS = DEFAULT_COLUMNS

function wrap(text, columns) {
  return wrapAnsi(text, columns || DEFAULT_COLUMNS, {
    trim: false
  })
}

module.exports.wrap = wrap

function frame(text, inline = false, wrapText = true) {
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

module.exports.frame = frame

function asciiText(text) {
  if (process.stdout.columns <= 78) {
    return chalk.bold(text)
  }
  return figlet.textSync(text)
}

module.exports.asciiText = asciiText

function separator(customWidth) {
  let width = customWidth || MAX_COLUMNS
  return chalk.dim(Array.from(Array(width + 1)).join('═'))
}

module.exports.separator = separator

function indent(text) {
  return `\n${text}`.replace(/\s*[\n\r]\s*/g, '\n    ')
}

module.exports.indent = indent

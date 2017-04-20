import Table from 'cli-table2'
import chalk from 'chalk'
import wrapAnsi from 'wrap-ansi'
import emojic from 'emojic'

const maxColumns = process.stdout.columns

export function wrap (text, columns) {
  return wrapAnsi(text, columns || maxColumns)
}

export function log (text) {
  if (!text) {
    return console.log()
  }
  console.log(text)
}

export function frame (text) {
  const table = new Table({
    colWidths: [maxColumns - 2],
    wordWrap: true
  })
  table.push([text])
  log(table.toString())
}

export function displayError (err) {
  try {
    const parsedError = JSON.parse(err.message)
    console.error(wrap(`${emojic.rotatingLight}  ${chalk.red('Error:')} ${parsedError.message}`))
    console.error(frame(err.toString()))
  } catch (parseError) {
    console.error(err || parseError)
  }
}

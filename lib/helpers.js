import Table from 'cli-table2'

export function logWithFrame (text) {
  const table = new Table()
  table.push([text])
  console.log(table.toString())
}

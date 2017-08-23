import Table from 'cli-table2'

import { getDisplayName } from './convert-field-type'
import { log } from '../../../utils/log'

export function logExtension (extension) {
  const table = new Table({
    head: ['Property', 'Value']
  })

  table.push(['ID', extension.sys.id])
  table.push(['Name', extension.extension.name])
  table.push([
    'Field types',
    extension.extension.fieldTypes.map(getDisplayName).join(', ')
  ])
  table.push(['Src', extension.extension.src || '[uses srcdoc]'])
  table.push(['Version', extension.sys.version])

  log(table.toString())
}

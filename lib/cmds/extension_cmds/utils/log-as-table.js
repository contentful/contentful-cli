import Table from 'cli-table3'
import { get, isArray } from 'lodash'

import { getDisplayName } from './convert-field-type'
import { log } from '../../../utils/log'

export function logExtension ({sys, extension, parameters}) {
  const table = new Table({
    head: ['Property', 'Value']
  })

  table.push(['ID', sys.id])
  table.push(['Name', extension.name])
  if (isArray(extension.fieldTypes)) {
    table.push([
      'Field types',
      extension.fieldTypes.map(getDisplayName).join(', ')
    ])
  }
  table.push(['Src', extension.src || '[uses srcdoc]'])
  table.push(['Version', sys.version])

  if (extension.sidebar) {
    table.push(['Sidebar', true])
  }

  const instanceDefinitions = get(extension, ['parameters', 'instance']) || []
  const installationDefinitions = get(extension, ['parameters', 'installation']) || []
  const installationValues = parameters || {}

  table.push([
    'Parameter definitions',
    `Instance: ${instanceDefinitions.length}\nInstallation: ${installationDefinitions.length}`
  ])

  table.push([
    'Installation parameter values',
    `${Object.keys(installationValues).length}`
  ])

  log(table.toString())
}

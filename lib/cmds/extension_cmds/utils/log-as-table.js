const Table = require('cli-table3')
const { get, isArray } = require('lodash')

const { getDisplayName } = require('./convert-field-type')
const { log } = require('../../../utils/log')

function logExtension(
  { sys, extension, parameters },
  spaceId,
  environmentId = 'master'
) {
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
  const installationDefinitions =
    get(extension, ['parameters', 'installation']) || []
  const installationValues = parameters || {}

  table.push([
    'Parameter definitions',
    `Instance: ${instanceDefinitions.length}\nInstallation: ${installationDefinitions.length}`
  ])

  table.push([
    'Installation parameter values',
    `${Object.keys(installationValues).length}`
  ])

  const url = [
    'https://app.contentful.com/spaces/',
    `${spaceId}/`,
    environmentId !== 'master' ? `environments/${environmentId}/` : '',
    'settings/extensions/',
    sys.id
  ].join('')

  log(`Space: ${spaceId}\n`)
  log(`Environment: ${environmentId}\n`)
  log(`Your extension: ${url}\n`)

  log(table.toString())
}

module.exports.logExtension = logExtension

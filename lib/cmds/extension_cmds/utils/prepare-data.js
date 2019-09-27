const fs = require('fs')
const { omitBy, assign, isUndefined } = require('lodash')

const { readFileP } = require('../../../utils/fs')
const { getFieldType } = require('./convert-field-type')
const { ValidationError } = require('../../../utils/error')

module.exports = async function prepareData(argv) {
  const descriptor = (await getDescriptor(argv.descriptor)) || {}
  const args = getExtensionData(argv)
  const descriptorArgs = getExtensionData(descriptor)

  // Enable overwriting the src or srcdoc via command arguments.
  // Will allow passing localhost as src for development and
  // using a html file via srcdoc for production.
  if ('src' in args || 'srcdoc' in args) {
    delete descriptorArgs.src
    delete descriptorArgs.srcdoc
  }

  return omitBy(
    {
      id: argv.id || descriptor.id,
      extension: assign({}, descriptorArgs, args),
      parameters: getInstallationParameterValues(argv)
    },
    isUndefined
  )
}

async function getDescriptor(filepath) {
  const DEFAULT_PATH = './extension.json'
  const path = filepath || (fs.existsSync(DEFAULT_PATH) && DEFAULT_PATH)

  if (path) {
    const file = await readFileP(path, 'utf8')

    try {
      return JSON.parse(file)
    } catch (e) {
      throw new ValidationError('Error parsing descriptor file')
    }
  }
}

function getExtensionData(data) {
  return omitBy(
    {
      name: data.name,
      fieldTypes: data.fieldTypes
        ? data.fieldTypes.map(getFieldType)
        : undefined,
      src: data.src,
      srcdoc: data.srcdoc,
      sidebar: data.sidebar,
      parameters: data.parameters
    },
    isUndefined
  )
}

function getInstallationParameterValues(data) {
  if (data.installationParameters) {
    try {
      return JSON.parse(data.installationParameters)
    } catch (e) {
      throw new ValidationError(
        'Could not parse JSON string of installation parameter values'
      )
    }
  }
}

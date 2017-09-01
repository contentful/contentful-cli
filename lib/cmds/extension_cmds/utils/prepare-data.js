import fs from 'fs'
import { omitBy, assign, isUndefined } from 'lodash'

import { readFileP } from '../../../utils/fs'
import { getFieldType } from './convert-field-type'
import { ValidationError } from '../../../utils/error'

export default async function prepareData (argv) {
  const descriptor = await getDescriptor(argv.descriptor) || {}
  const args = getExtensionData(argv)
  const descriptorArgs = getExtensionData(descriptor)

  const id = argv.id || descriptor.id

  return {
    ...id && id, // only return the key if it is defined
    extension: assign({}, descriptorArgs, args)
  }
}

async function getDescriptor (filepath) {
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

function getExtensionData (data) {
  return omitBy({
    name: data.name,
    fieldTypes: data.fieldTypes ? data.fieldTypes.map(getFieldType) : undefined,
    src: data.src,
    srcdoc: data.srcdoc,
    sidebar: data.sidebar
  }, isUndefined)
}

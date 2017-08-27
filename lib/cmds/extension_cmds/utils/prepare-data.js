import fs from 'fs'
import { omitBy, extend, isUndefined, mapValues, isPlainObject } from 'lodash'

import { logError } from '../../../utils/log'
import { readFileP } from '../../../utils/fs'
import { getFieldType } from './convert-field-type'

export default async function prepareData (argv) {
  const descriptor = await getDescriptor(argv.descriptor)
  const args = parse(argv)

  if (descriptor) {
    const descriptorArgs = parse(descriptor)
    const merged = extend({}, descriptorArgs, args)
    return merged
  } else {
    return args
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
      logError('Error parsing descriptor file')
    }
  }
}

function parse (data) {
  return deepOmitUndefined({
    id: data.id,
    extension: {
      name: data.name,
      fieldTypes: data.fieldTypes ? data.fieldTypes.map(getFieldType) : undefined,
      src: data.src,
      srcdoc: data.srcdoc,
      sidebar: data.sidebar
    }
  })
}

function deepOmitUndefined (obj) {
  return mapValues(omitBy(obj, isUndefined), function (val) {
    return isPlainObject(val) ? deepOmitUndefined(val) : val
  })
}

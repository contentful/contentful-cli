import fs from 'fs'
import { pickBy, extend, isUndefined } from 'lodash'

import { logError } from '../../../utils/log'
import { readFileP } from '../../../utils/fs'

export default async function mergeDescriptor (argv) {
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

function parse (obj) {
  const props = ['id', 'name', 'fieldTypes', 'src', 'srcdoc', 'sidebar']

  return pickBy(obj, function (val, key) {
    return !isUndefined(val) && props.includes(key)
  })
}

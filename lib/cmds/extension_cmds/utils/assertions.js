import { kebabCase } from 'lodash'

import { ValidationError } from '../../../utils/error'

export async function assertExtensionValuesProvided (data, action) {
  if (action === 'update') {
    await assertHasRequiredProperties(data, ['id'])
  }
  await assertHasRequiredProperties(data.extension, ['name', 'fieldTypes'])
  await assertHasOneProperty(data.extension, ['src', 'srcdoc'])
}

async function assertHasRequiredProperties (extension, required) {
  const missingRequiredFields = required.reduce(function (missing, field) {
    return extension.hasOwnProperty(field) ? missing : [...missing, field]
  }, [])

  if (missingRequiredFields.length) {
    throw new ValidationError(
      `Missing required properties: ${
        missingRequiredFields.map(kebabCase).join(', ')
      }`
    )
  }
}

async function assertHasOneProperty (extension, list) {
  const filtered = list.filter(function (prop) {
    return extension.hasOwnProperty(prop)
  })

  if (filtered.length !== 1) {
    throw new ValidationError(
      `Must contain exactly one of: ${list.join(', ')}`
    )
  }
}

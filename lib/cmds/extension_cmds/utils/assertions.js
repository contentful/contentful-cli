import { kebabCase } from 'lodash'

import { ValidationError } from '../../../utils/error'

export async function assertRequiredValuesProvided ({extension}) {
  const required = ['name', 'fieldTypes']
  const hasOneSrc = extension.hasOwnProperty('src') !== extension.hasOwnProperty('srcdoc')
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

  if (!hasOneSrc) {
    throw new ValidationError(
      'Must contain one of either src or srcdoc property'
    )
  }
}

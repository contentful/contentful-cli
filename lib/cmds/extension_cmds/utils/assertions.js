import { ValidationError } from '../../../utils/error'

export async function assertRequiredValuesProvided (obj) {
  const required = ['name', 'fieldTypes']
  const hasOneSrc = obj.hasOwnProperty('src') !== obj.hasOwnProperty('srcdoc')
  const missingRequiredFields = required.reduce(function (missing, field) {
    return obj.hasOwnProperty(field) ? missing : [...missing, field]
  }, [])

  if (missingRequiredFields.length) {
    throw new ValidationError(
      `Missing required properties: ${missingRequiredFields.join(', ')}`
    )
  }

  if (!hasOneSrc) {
    throw new ValidationError(
      'Must contain one of either src or srcdoc property'
    )
  }
}

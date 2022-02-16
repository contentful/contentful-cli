const { kebabCase } = require('lodash')

const { ValidationError } = require('../../../utils/error')

async function assertHasRequiredProperties(extension, required) {
  const missingRequiredFields = required.reduce((missing, field) => {
    return Object.prototype.hasOwnProperty.call(extension, field)
      ? missing
      : [...missing, field]
  }, [])

  if (missingRequiredFields.length) {
    throw new ValidationError(
      `Missing required properties: ${missingRequiredFields
        .map(kebabCase)
        .join(', ')}`
    )
  }
}

async function assertHasOneProperty(extension, list) {
  const filtered = list.filter(prop => {
    return (
      Object.prototype.hasOwnProperty.call(extension, prop) && !extension.prop
    )
  })

  if (filtered.length === list.length || filtered.length === 0) {
    throw new ValidationError(`Must contain exactly one of: ${list.join(', ')}`)
  }
}

async function assertForceOrCorrectVersionProvided(data, targetVersion) {
  if (!data.force && !data.version) {
    throw new ValidationError(
      'Please provide current version or use the --force flag'
    )
  }

  if (data.version && data.version !== targetVersion) {
    throw new ValidationError(
      'Version provided does not match current resource version'
    )
  }
}

module.exports.assertForceOrCorrectVersionProvided =
  assertForceOrCorrectVersionProvided

async function assertExtensionValuesProvided(data, action) {
  if (action === 'update') {
    await assertHasRequiredProperties(data, ['id'])
  }
  await assertHasRequiredProperties(data.extension, ['name'])
  await assertHasOneProperty(data.extension, ['src', 'srcdoc'])
}

module.exports.assertExtensionValuesProvided = assertExtensionValuesProvided

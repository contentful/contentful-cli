function PreconditionFailedError(message) {
  this.message = message
  this.stack = Error().stack
}

module.exports.PreconditionFailedError = PreconditionFailedError

PreconditionFailedError.prototype = Object.create(Error.prototype)
PreconditionFailedError.prototype.name = 'PreconditionFailedError'

function InvalidConfigOptionsError(message) {
  this.message = message
  this.stack = Error().stack
}

module.exports.InvalidConfigOptionsError = InvalidConfigOptionsError

InvalidConfigOptionsError.prototype = Object.create(Error.prototype)
InvalidConfigOptionsError.prototype.name = 'InvalidConfigOptionsError'

function ValidationError(message) {
  this.message = message
  this.stack = Error().stack
}

module.exports.ValidationError = ValidationError

ValidationError.prototype = Object.create(Error.prototype)
ValidationError.prototype.name = 'ValidationError'

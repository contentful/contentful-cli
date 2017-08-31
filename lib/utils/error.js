export function PreconditionFailedError (message) {
  this.message = message
  this.stack = Error().stack
}

PreconditionFailedError.prototype = Object.create(Error.prototype)
PreconditionFailedError.prototype.name = 'PreconditionFailedError'

export function InvalidConfigOptionsError (message) {
  this.message = message
  this.stack = Error().stack
}

InvalidConfigOptionsError.prototype = Object.create(Error.prototype)
InvalidConfigOptionsError.prototype.name = 'InvalidConfigOptionsError'

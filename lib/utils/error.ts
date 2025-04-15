export class PreconditionFailedError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'PreconditionFailedError'

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PreconditionFailedError)
    }
  }
}

export class InvalidConfigOptionsError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'InvalidConfigOptionsError'

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidConfigOptionsError)
    }
  }
}

export class ValidationError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'ValidationError'

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }
  }
}

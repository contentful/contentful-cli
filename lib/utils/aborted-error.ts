// Error class for when a process is aborted
export class AbortedError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'AbortedError'

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AbortedError)
    }
  }
}

import { warningStyle, errorStyle, successStyle } from './styles'
import { errorEmoji } from './emojis'
import { wrap, frame } from './text'
import { PreconditionFailedError } from './error'

export function log(...args: any[]): void {
  console.log(...args)
}

export function wrappedLog(text: string, columns?: number): void {
  log(wrap(text, columns))
}

export function warning(...args: any[]): void {
  const styledArgs = args.map(arg => warningStyle(arg))
  console.log(...styledArgs)
}

export function success(...args: any[]): void {
  const styledArgs = args.map(arg => successStyle(arg))
  console.log(...styledArgs)
}

export function error(...args: any[]): void {
  const styledArgs = args.map(arg => errorStyle(arg))
  console.error(...styledArgs)
}

interface ParsedError {
  message: string
  details?: {
    errors?: Array<{
      path?: string[]
      details?: string
    }>
  }
}

export function logError(error: Error | any): void {
  try {
    if (!Object.prototype.hasOwnProperty.call(error, 'message')) {
      throw error
    }
    const parsedError: ParsedError = JSON.parse(error.message)
    console.error(
      wrap(errorStyle(`${errorEmoji} Error: ${parsedError.message}`))
    )
    if (parsedError.details && parsedError.details.errors) {
      parsedError.details.errors.forEach(errItem => {
        if (errItem.path && errItem.details) {
          console.error(
            errorStyle(`${errItem.details} at ${errItem.path.join('/')}`)
          )
        }
      })
    }
    console.error(frame(JSON.stringify(parsedError, null, '\t')))
  } catch (parseError) {
    console.error(wrap(errorStyle(`${errorEmoji} Error: ${error.message}`)))
    if ('stack' in error && !(error instanceof PreconditionFailedError)) {
      console.error(frame(error.stack.toString()))
    }
  }
}

// Add default export for backward compatibility with files using default import
export default {
  log,
  wrappedLog,
  warning,
  success,
  error,
  logError
}

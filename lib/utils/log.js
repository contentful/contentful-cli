import { warningStyle, errorStyle, successStyle } from './styles.js'
import { errorEmoji } from './emojis.js'
import { wrap, frame } from './text.js'
import { PreconditionFailedError } from './error.js'

export function log(...args) {
  console.log(...args)
}

export function wrappedLog(text, columns) {
  log(wrap(text, columns))
}

export function warning(...args) {
  const styledArgs = args.map(arg => warningStyle(arg))
  console.log(...styledArgs)
}

export function success(...args) {
  const styledArgs = args.map(arg => successStyle(arg))
  console.log(...styledArgs)
}

export function error(...args) {
  const styledArgs = args.map(arg => errorStyle(arg))
  console.error(...styledArgs)
}

export function logError(error) {
  try {
    if (!Object.prototype.hasOwnProperty.call(error, 'message')) {
      throw error
    }
    const parsedError = JSON.parse(error.message)
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

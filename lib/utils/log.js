import { warningStyle, errorStyle, successStyle } from './styles'
import { errorEmoji } from './emojis'
import { wrap, frame } from './text'
import { PreconditionFailedError } from './error'

export function log (...args) {
  console.log(...args)
}

export function wrappedLog (text, columns) {
  log(wrap(text, columns))
}

export function warning (...args) {
  const styledArgs = args.map((arg) => warningStyle(arg))
  console.log(...styledArgs)
}

export function success (...args) {
  const styledArgs = args.map((arg) => successStyle(arg))
  console.log(...styledArgs)
}

export function error (...args) {
  const styledArgs = args.map((arg) => errorStyle(arg))
  console.error(...styledArgs)
}

export function logError (error) {
  try {
    const parsedError = JSON.parse(error.message)
    console.error(wrap(errorStyle(`${errorEmoji} Error: ${parsedError.message}`)))
    console.error(frame(JSON.stringify(parsedError, null, '\t')))
  } catch (parseError) {
    console.error(wrap(errorStyle(`${errorEmoji} Error: ${error.message}`)))
    if ('stack' in error && !(error instanceof PreconditionFailedError)) {
      console.error(frame(error.stack.toString()))
    }
  }
}

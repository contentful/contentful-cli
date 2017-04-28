import { infoStyle, warningStyle, errorStyle, successStyle } from './styles'
import { errorEmoji } from './emojis'
import { wrap, frame } from './text'
import { PreconditionFailedError } from './error'

export function log (/**/) {
  console.log.apply(null, arguments)
}

export function info (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => infoStyle(arg))
  console.log.apply(null, styledArgs)
}

export function warning (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => warningStyle(arg))
  console.log.apply(null, styledArgs)
}

export function success (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => successStyle(arg))
  console.log.apply(null, styledArgs)
}

export function error (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => errorStyle(arg))
  console.error.apply(null, styledArgs)
}

export function logError (err) {
  try {
    const parsedError = JSON.parse(err.message)
    console.error(wrap(errorStyle(`${errorEmoji} Error: ${parsedError.message}`)))
    console.error(frame(err.toString()))
  } catch (parseError) {
    const error = err || parseError
    console.error(wrap(errorStyle(`${errorEmoji} Error: ${error.message}`)))
    if ('stack' in error && !(error instanceof PreconditionFailedError)) {
      frame(error.stack.toString())
    }
  }
}

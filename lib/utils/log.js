const { warningStyle, errorStyle, successStyle } = require('./styles')
const { errorEmoji } = require('./emojis')
const { wrap, frame } = require('./text')
const { PreconditionFailedError } = require('./error')

function log(...args) {
  console.log(...args)
}

module.exports.log = log

function wrappedLog(text, columns) {
  log(wrap(text, columns))
}

module.exports.wrappedLog = wrappedLog

function warning(...args) {
  const styledArgs = args.map(arg => warningStyle(arg))
  console.log(...styledArgs)
}

module.exports.warning = warning

function success(...args) {
  const styledArgs = args.map(arg => successStyle(arg))
  console.log(...styledArgs)
}

module.exports.success = success

function error(...args) {
  const styledArgs = args.map(arg => errorStyle(arg))
  console.error(...styledArgs)
}

module.exports.error = error

function logError(error) {
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

module.exports.logError = logError

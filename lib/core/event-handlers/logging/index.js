const { filter, map } = require('rxjs/operators')
const { merge, Subject } = require('rxjs')

const levelToMethodMappings = {
  info: 'log',
  success: 'success',
  warn: 'warning',
  error: 'error'
}

const isInScope = scopes => message => scopes.includes(message.scope)

const createLoggingStream = (events$, loggingConfig) => {
  // Get all the log levels that the logging handler has
  const logTypes = Object.keys(loggingConfig.messages)
  // Change structure so that we look up the message handler
  // and the log level by the payload code
  const codeToMessage = logTypes.reduce((messages, level) => {
    const messagesForType = loggingConfig.messages[level]
    const method = levelToMethodMappings[level]
    const messageCode = Object.keys(messagesForType)

    for (const code of messageCode) {
      messages[code] = {
        method,
        messageHandler: messagesForType[code]
      }
    }

    return messages
  }, {})

  const scopedEvents$ = events$.pipe(filter(isInScope(loggingConfig.scopes)))

  const loggingData$ = scopedEvents$.pipe(
    map(({ payload }) => {
      const messageConf = codeToMessage[payload.code]

      if (!messageConf) {
        return undefined
      }

      return {
        method: messageConf.method,
        message: messageConf.messageHandler(payload)
      }
    }),
    filter(message => message !== undefined)
  )

  return loggingData$
}

class LoggingSystem {
  constructor(logging) {
    this.handlersStream = new Subject()
    this.handlersStream.subscribe(message => {
      logging[message.method](message.message)
    })

    this.handlers = []
  }

  addHandler(loggingHandler) {
    this.handlers.push(loggingHandler)
  }

  connect(events$) {
    const loggingStreams = this.handlers.map(
      createLoggingStream.bind(null, events$)
    )
    const logStream$ = merge(...loggingStreams)

    logStream$.subscribe(this.handlersStream)
  }
}

module.exports = LoggingSystem

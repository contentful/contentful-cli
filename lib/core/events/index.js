const { fromEvent } = require('rxjs')
const { EventEmitter } = require('events')

const ERROR = 'ERROR'
const MESSAGE = 'MESSAGE'
const INTENT = 'INTENT'

module.exports.ERROR = ERROR
module.exports.MESSAGE = MESSAGE
module.exports.INTENT = INTENT

function error(scope, code, data = {}) {
  return {
    type: ERROR,
    scope,
    payload: {
      code,
      ...data
    }
  }
}

module.exports.error = error

function message(scope, code, data = {}) {
  return {
    type: MESSAGE,
    scope,
    payload: {
      code,
      ...data
    }
  }
}

module.exports.message = message

function intent(scope, code, data = {}) {
  return {
    type: INTENT,
    scope,
    payload: {
      code,
      ...data
    }
  }
}

module.exports.intent = intent

const MESSAGE_KEY = 'message'

class MessageDispatcher {
  constructor(eventSystem, scope) {
    this.eventSystem = eventSystem
    this.scope = scope
  }

  dispatch(code, data = {}) {
    return this.eventSystem.emit(message(this.scope, code, data))
  }

  error(code, data = {}) {
    return this.eventSystem.emit(error(this.scope, code, data))
  }

  intent(code, data = {}) {
    return this.eventSystem.emitIntent(intent(this.scope, code, data))
  }
}

class EventSystem {
  constructor() {
    this.emitter = new EventEmitter()
    this.messageStream = fromEvent(this.emitter, MESSAGE_KEY)
  }

  emit(data) {
    this.emitter.emit(MESSAGE_KEY, data)
  }

  emitIntent(intent) {
    return new Promise((resolve, reject) => {
      // Basically, create a deferred and emit it
      // while returning the promise it will resolve
      const deferredIntent = Object.assign(
        {
          resolve,
          reject
        },
        intent
      )

      this.emitter.emit('message', deferredIntent)
    })
  }

  dispatcher(scope) {
    return new MessageDispatcher(this, scope)
  }

  attachSubsystem(subsystem) {
    subsystem.connect(this.messageStream)
  }
}

module.exports.EventSystem = EventSystem

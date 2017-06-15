import { EventEmitter } from 'events'
import { Observable } from 'rxjs/Rx'
import Bluebird from 'bluebird'

export const ERROR = 'ERROR'
export const MESSAGE = 'MESSAGE'
export const INTENT = 'INTENT'

export function error (scope, code, data = {}) {
  return {
    type: ERROR,
    scope,
    payload: {
      code,
      ...data
    }
  }
}

export function message (scope, code, data = {}) {
  return {
    type: MESSAGE,
    scope,
    payload: {
      code,
      ...data
    }
  }
}

export function intent (scope, code, data = {}) {
  return {
    type: INTENT,
    scope,
    payload: {
      code,
      ...data
    }
  }
}

const MESSAGE_KEY = 'message'

class MessageDispatcher {
  constructor (eventSystem, scope) {
    this.eventSystem = eventSystem
    this.scope = scope
  }

  dispatch (code, data = {}) {
    return this.eventSystem.emit(message(this.scope, code, data))
  }

  error (code, data = {}) {
    return this.eventSystem.emit(error(this.scope, code, data))
  }

  intent (code, data = {}) {
    return this.eventSystem.emitIntent(intent(this.scope, code, data))
  }
}

export class EventSystem {
  constructor () {
    this.emitter = new EventEmitter()
    this.messageStream = Observable.fromEvent(this.emitter, MESSAGE_KEY)
  }

  emit (data) {
    this.emitter.emit(MESSAGE_KEY, data)
  }

  emitIntent (intent) {
    return new Bluebird((resolve, reject) => {
      // Basically, create a deferred and emit it
      // while returning the promise it will resolve
      const deferredIntent = Object.assign({
        resolve,
        reject
      }, intent)

      this.emitter.emit('message', deferredIntent)
    })
  }

  dispatcher (scope) {
    return new MessageDispatcher(this, scope)
  }

  attachSubsystem (subsystem) {
    subsystem.connect(this.messageStream)
  }
}

const { Observable, Subject } = require('rxjs/Rx')
const Bluebird = require('bluebird')

const createIntentStream = (events$, intentConfig) => {
  const intentEvents$ = events$.filter(message => {
    return message.type === 'INTENT'
  })

  const scopedEvents$ = intentEvents$.filter(message => {
    return intentConfig.scopes.includes(message.scope)
  })

  const handlers$ = scopedEvents$.map(({ payload, resolve, reject }) => {
    return {
      handler: intentConfig.intents[payload.code],
      payload,
      resolve,
      reject
    }
  })

  return handlers$
}

class IntentSystem {
  constructor() {
    this.handlersStream = new Subject()
    this.handlersStream.subscribe(({ handler, payload, resolve, reject }) => {
      Bluebird.try(() => {
        return handler(payload)
      })
        .then(resolve)
        .catch(reject)
    })

    this.handlers = []
  }

  addHandler(intentHandler) {
    this.handlers.push(intentHandler)
  }

  connect(events$) {
    const intentStreams = this.handlers.map(
      createIntentStream.bind(null, events$)
    )
    const handlers$ = Observable.merge(...intentStreams)

    handlers$.subscribe(this.handlersStream)
  }
}

module.exports = IntentSystem

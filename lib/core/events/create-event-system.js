const LoggingSystem = require('../event-handlers/logging')
const IntentSystem = require('../event-handlers/intents')
const { EventSystem } = require('./index')
const logging = require('../../utils/log')

function createEventSystem({ loggingHandlers = [], intentHandlers = [] }) {
  const loggingSystem = new LoggingSystem(logging)
  for (const loggingHandler of loggingHandlers) {
    loggingSystem.addHandler(loggingHandler)
  }

  const intentSystem = new IntentSystem()
  for (const intentHandler of intentHandlers) {
    intentSystem.addHandler(intentHandler)
  }

  const eventSystem = new EventSystem()
  eventSystem.attachSubsystem(loggingSystem)
  eventSystem.attachSubsystem(intentSystem)

  return eventSystem
}

module.exports.createEventSystem = createEventSystem

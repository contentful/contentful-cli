import LoggingSystem from '../event-handlers/logging/index.mjs'
import IntentSystem from '../event-handlers/intents/index.mjs'
import { EventSystem } from './index.mjs'
import * as logging from '../../utils/log.mjs'

export function createEventSystem({
  loggingHandlers = [],
  intentHandlers = []
}) {
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

import LoggingSystem from '../event-handlers/logging'
import IntentSystem from '../event-handlers/intents'
import { EventSystem } from './index'
import * as logging from '../../utils/log'

export function createEventSystem ({ loggingHandlers = [], intentHandlers = [] }) {
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

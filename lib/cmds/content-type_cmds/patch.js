import * as helpers from '../../core/patch/helpers'
import patchHandler from '../../core/patch/patch-file-handler'
import { getContext } from '../../context'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import applyPatches from '../../core/patch/make-patch-hooks'
import { createManagementClient } from '../../utils/contentful-clients'
import * as logging from '../../utils/log'

import { EventSystem } from '../../core/events'

import IntentSystem from '../../core/event-handlers/intents'
import LoggingSystem from '../../core/event-handlers/logging'

import patchFileIntents from '../../core/event-handlers/intents/patch-file-handler'
import patchHooksIntents from '../../core/event-handlers/intents/patch-hooks'

import patchFileLogging from '../../core/event-handlers/logging/patch-file-handler'
import patchHooksLogging from '../../core/event-handlers/logging/patch-hooks'

export const command = 'patch'
export const desc = '[BETA] Patch a content type'

export const builder = (yargs) => {
  return yargs
  .option('space-id', { type: 'string', describe: 'Space id' })
  .option('patch-file', { demand: true, alias: 'p' })
  .option('dry-run', {
    type: 'boolean',
    describe: 'Do not save the changes to the Content Type',
    default: false
  })
  .option('yes', {
    type: 'boolean',
    describe: 'Do not ask for confirmation for each patch',
    default: false
  })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

async function ctPatch (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const args = {
    spaceId,
    accessToken: cmaToken,
    patchFilePath: argv.patchFile,
    yes: argv.yes,
    dryRun: argv.dryRun
  }

  const intentSystem = new IntentSystem()
  intentSystem.addHandler(patchFileIntents({
    skipConfirm: argv.yes
  }))
  intentSystem.addHandler(patchHooksIntents({
    skipConfirm: argv.yes
  }))

  const loggingSystem = new LoggingSystem(logging)
  loggingSystem.addHandler(patchFileLogging)
  loggingSystem.addHandler(patchHooksLogging)

  const eventSystem = new EventSystem()
  eventSystem.attachSubsystem(intentSystem)
  eventSystem.attachSubsystem(loggingSystem)

  return patchHandler(args, createManagementClient, applyPatches, helpers, eventSystem)
}

export const handler = handle(ctPatch)

import { createManagementClient } from '../../utils/contentful-clients'
import * as helpers from '../content-type_cmds/patch/helpers'
import patchHandler from './patch-handler'
import applyPatches from '../content-type_cmds/utils/apply-patches'
import { handleAsyncError as handle } from '../../utils/async'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { getContext } from '../../context'
import * as logging from '../../utils/log'

export const command = 'patch'
export const desc = 'Patch a content type'

export const builder = (yargs) => {
  return yargs
  .option('space-id', { type: 'string', describe: 'Space id' })
  .option('patch-dir', { demand: true, alias: 'p' })
  .option('dry-run', {
    type: 'boolean',
    describe: 'Do not save the changes to the Content Model',
    default: false
  })
  .option('skip-confirm', {
    type: 'boolean',
    describe: 'Do not ask for confirmation for each patch',
    default: false
  })
}

export const handler = handle(async function (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const context = await getContext()
  const {activeSpaceId, cmaToken} = context
  const spaceId = argv.spaceId || activeSpaceId

  const patchFilePaths = await helpers.readPatchDir(argv.patchDir)
  const args = {
    spaceId,
    accessToken: cmaToken,
    patchFilePaths,
    skipConfirm: argv.skipConfirm,
    dryRun: argv.dryRun
  }

  await patchHandler(args, createManagementClient, applyPatches, helpers, logging)
})

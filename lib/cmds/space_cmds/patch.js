import { createClient } from 'contentful-management'
import _ from 'lodash'

import * as helpers from '../content-type_cmds/patch/helpers'
import applyPatches from '../content-type_cmds/utils/apply-patches'

import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { getContext } from '../../context'
import { log, logError } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'
import ContentTypeProxy from '../content-type_cmds/utils/content-type-proxy'
import { successEmoji } from '../../utils/emojis'

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

  const client = createClient({accessToken: cmaToken,
    headers: {'X-Contentful-Beta-Content-Type-Migration': true}
  })

  const space = await client.getSpace(spaceId)
  await batchPatch(space, argv.patchDir, helpers, argv)
})

export async function batchPatch (space, patchDir, helpers, argv) {
  const patchFilePaths = await helpers.readPatchDir(patchDir)

  for (let patchFilePath of patchFilePaths) {
    const patchFile = await helpers.readPatchFile(patchFilePath)

    if (!patchFile.id) return logError(`No content type id provided in ${patchFilePath}`)
    if (!patchFile.patches) return logError({message: `No patches provided in ${patchFilePath}`})

    let contentType
    try {
      contentType = await space.getContentType(patchFile.id)
    } catch (e) {
      if (e.name === 'NotFound') {
        contentType = new ContentTypeProxy(patchFile.id, space)
      }
    }
    const options = _.pick(argv, ['skipConfirm', 'dryRun'])
    await applyPatches(patchFile, contentType, helpers, options)

    if (!options.dryRun) {
      log(`${successEmoji} Patches applied`)
    }
  }
}

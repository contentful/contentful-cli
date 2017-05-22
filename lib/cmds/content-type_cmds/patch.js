import { createClient } from 'contentful-management'
import _ from 'lodash'

import * as helpers from './patch/helpers'

import { getContext } from '../../context'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import applyPatches from './utils/apply-patches'
import ContentTypeProxy from './utils/content-type-proxy'
import { log } from '../../utils/log'
import { successEmoji } from '../../utils/emojis'

export const command = 'patch'
export const desc = 'Patch a content type'

export const builder = (yargs) => {
  return yargs
  .option('space-id', { type: 'string', describe: 'Space id' })
  .option('patch-file', { demand: true, alias: 'p' })
  .option('dry-run', {
    type: 'boolean',
    describe: 'Do not save the changes to the Content Type',
    default: false
  })
  .option('skip-confirm', {
    type: 'boolean',
    describe: 'Do not ask for confirmation for each patch',
    default: false
  })
}

async function ctPatch (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = createClient({
    accessToken: cmaToken,
    headers: {
      'X-Contentful-Beta-Content-Type-Migration': 'true'
    }
  })

  const space = await client.getSpace(spaceId)
  const patchFile = await helpers.readPatchFile(argv.patchFile)
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

export const handler = handle(ctPatch)

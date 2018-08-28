import { resolve } from 'path'
import { tmpdir } from 'os'

import spaceImport from 'contentful-import'
import bfj from 'bfj'

import { getContext } from '../../context'
import { confirmation } from '../../utils/actions'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { successEmoji } from '../../utils/emojis'
import { getLatestGitHubRelease } from '../../utils/github'
import { log, success } from '../../utils/log'
import normalizer from '../../utils/normalizer'
import { highlightStyle, warningStyle } from '../../utils/styles'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'

export const command = 'seed'
export const desc = 'Seed a content model and content based on given templates'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space seed --template blog')
    .option('template', {
      alias: 't',
      describe: 'The template to apply on your Space. All possible options are listed here: https://github.com/contentful/content-models',
      demandOption: true,
      nargs: 1
    })
    .option('space-id', {
      alias: 's',
      describe: 'ID of the Space to seed the data to',
      nargs: 1
    })
    .option('management-token', {
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('yes', {
      describe: 'Skip the confirmation question',
      default: false
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export async function spaceSeed (argv) {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)
  const { spaceId } = await normalizer(argv)
  const { cmaToken, host = 'api.contentful.com', proxy, rawProxy } = await getContext()
  const managementToken = argv.managementToken || cmaToken
  const client = await createManagementClient({
    accessToken: managementToken,
    feature: argv.feature || 'space-seed',
    proxy,
    rawProxy
  })

  const space = await client.getSpace(spaceId)

  if (!argv.yes) {
    log(`You are about to apply changes to your ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) Space. Existing content might be overwritten.`)
    log()

    const confirm = await confirmation('Do you want to apply the changes to your Space now?')
    log()

    if (!confirm) {
      log(warningStyle(`User aborted the population of structure and content to the Space.`))
      return
    }
  }

  const destination = resolve(tmpdir(), '.contentful', 'content-models')
  await getLatestGitHubRelease('contentful/content-models', destination).run()
  const content = await bfj.read(resolve(destination, argv.template, 'contentful-export.json'))

  log()
  await spaceImport({
    content,
    spaceId,
    host,
    managementToken: cmaToken,
    managementFeature: argv.feature || 'space-seed'
  })

  log()
  success(`${successEmoji} The Content model was applied to your ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) Space.`)
}

export const handler = handle(spaceSeed)

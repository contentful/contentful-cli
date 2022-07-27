import { resolve } from 'path'
import { tmpdir } from 'os'
import spaceImport from 'contentful-import'
import bfj from 'bfj'
import { confirmation } from '../../utils/actions.mjs'
import { handleAsyncError as handle } from '../../utils/async.mjs'
import { createManagementClient } from '../../utils/contentful-clients.mjs'
import { successEmoji } from '../../utils/emojis.mjs'
import { getLatestGitHubRelease } from '../../utils/github.mjs'
import { log, success } from '../../utils/log.mjs'
import { highlightStyle, warningStyle } from '../../utils/styles.mjs'
import { getHeadersFromOption } from '../../utils/headers.mjs'

export const command = 'seed'
export const desc = 'Seed a content model and content based on given templates'

export const builder = yargs => {
  return yargs
    .usage('Usage: contentful space seed --template blog')
    .option('template', {
      alias: 't',
      describe:
        'The template to apply on your Space. All possible options are listed here: https://github.com/contentful/content-models',
      demandOption: true,
      nargs: 1
    })
    .option('space-id', {
      alias: 's',
      describe: 'ID of the Space to seed the data to',
      nargs: 1
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('yes', {
      describe: 'Skip the confirmation question'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

export async function spaceSeed({
  context,
  yes,
  template,
  feature = 'space-seed',
  header
}) {
  const { managementToken, activeSpaceId, host, proxy, rawProxy } = context
  const client = await createManagementClient({
    accessToken: managementToken,
    feature,
    proxy,
    rawProxy,
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  if (!yes) {
    log(
      `You are about to apply changes to your ${highlightStyle(
        space.name
      )} (${highlightStyle(
        space.sys.id
      )}) Space. Existing content might be overwritten.`
    )
    log()

    const confirm = await confirmation(
      'Do you want to apply the changes to your Space now?'
    )
    log()

    if (!confirm) {
      log(
        warningStyle(
          `User aborted the population of structure and content to the Space.`
        )
      )
      return
    }
  }

  const destination = resolve(tmpdir(), '.contentful', 'content-models')
  await getLatestGitHubRelease('contentful/content-models', destination).run()
  const content = await bfj.read(
    resolve(destination, template, 'contentful-export.json')
  )

  log()
  await spaceImport({
    content,
    spaceId: activeSpaceId,
    host,
    managementToken,
    managementFeature: feature || 'space-seed'
  })

  log()
  success(
    `${successEmoji} The Content model was applied to your ${highlightStyle(
      space.name
    )} (${highlightStyle(space.sys.id)}) Space.`
  )
}

export const handler = handle(spaceSeed)

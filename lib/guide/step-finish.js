import { join, relative } from 'path'

import chalk from 'chalk'
import { readFile } from 'fs'
import markdown from 'markdown-cli'

import { getContext } from '../context'
import { createManagementClient } from '../utils/contentful-clients'
import { log, success, wrappedLog } from '../utils/log'
import { frame, separator } from '../utils/text'
import { codeStyle, pathStyle } from '../utils/styles'
import { successEmoji } from '../utils/emojis'

import { GUIDE_MAX_WIDTH } from './helpers'

export default async function finishStep (guideContext) {
  const { installationDirectory, activeGuide, spaceId } = guideContext

  const { cmaToken, host = 'api.contentful.com' } = await getContext()

  const client = await createManagementClient({
    host,
    accessToken: cmaToken,
    feature: 'guide'
  })

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment('master')

  const entries = await environment.getEntries()

  log(separator(GUIDE_MAX_WIDTH))
  success(`${successEmoji}${chalk.bold('Congratulations!')} The guide is now completed.`)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(`Your space contains ${entries.items.length} entries. Add or change them at ${pathStyle(`https://app.contentful.com/spaces/${spaceId}/entries`)}.`, GUIDE_MAX_WIDTH)
  log()
  log(`Navigate to your ${activeGuide.name} via: ${codeStyle(`cd ${relative(process.cwd(), installationDirectory)}`)}`)
  log()
  try {
    const whatsNextText = await readFile(join(installationDirectory, 'WHATS-NEXT.MD'))
    log(frame(markdown(whatsNextText.toString()).trim()))
  } catch (e) { }
}

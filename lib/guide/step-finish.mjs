import { join, relative } from 'path'
import chalk from 'chalk'
import fs from 'fs'
import markdown from '../utils/markdown.mjs'
import { getContext } from '../context.mjs'
import { createManagementClient } from '../utils/contentful-clients.mjs'
import { log, success, wrappedLog } from '../utils/log.mjs'
import { frame, separator } from '../utils/text.mjs'
import { codeStyle, pathStyle } from '../utils/styles.mjs'
import { successEmoji } from '../utils/emojis.mjs'
import { GUIDE_MAX_WIDTH } from './helpers.mjs'

export default async function finishStep(guideContext) {
  const { installationDirectory, activeGuide, spaceId } = guideContext

  const { managementToken, host } = await getContext()

  const client = await createManagementClient({
    host,
    accessToken: managementToken,
    feature: 'guide'
  })

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment('master')

  const entries = await environment.getEntries()

  log(separator(GUIDE_MAX_WIDTH))
  success(
    `${successEmoji}${chalk.bold(
      'Congratulations!'
    )} The guide is now completed.`
  )
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(
    `Your space contains ${
      entries.items.length
    } entries. Add or change them at ${pathStyle(
      `https://app.contentful.com/spaces/${spaceId}/entries`
    )}.`,
    GUIDE_MAX_WIDTH
  )
  log()
  log(
    `Navigate to your ${activeGuide.name} via: ${codeStyle(
      `cd ${relative(process.cwd(), installationDirectory)}`
    )}`
  )
  log()
  try {
    const whatsNextText = fs.readFileSync(
      join(installationDirectory, 'WHATS-NEXT.MD')
    )
    log(frame(markdown(whatsNextText.toString()).trim()))
  } catch (e) {
    // ignore error
  }
}

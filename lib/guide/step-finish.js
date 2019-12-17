const { join, relative } = require('path')

const chalk = require('chalk')
const fs = require('fs')

const markdown = require('../utils/markdown')
const { getContext } = require('../context')
const { createManagementClient } = require('../utils/contentful-clients')
const { log, success, wrappedLog } = require('../utils/log')
const { frame, separator } = require('../utils/text')
const { codeStyle, pathStyle } = require('../utils/styles')
const { successEmoji } = require('../utils/emojis')

const { GUIDE_MAX_WIDTH } = require('./helpers')

module.exports = async function finishStep(guideContext) {
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

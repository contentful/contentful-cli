import { join, relative } from 'path'

import chalk from 'chalk'
import { readFile } from 'mz/fs'
import markdown from 'markdown-cli'

import { log, success } from '../../utils/log'
import { frame } from '../../utils/text'
import { codeStyle } from '../../utils/styles'
import { successEmoji } from '../../utils/emojis'

export default async function finishStep (guideContext) {
  const { installationDirectory, activeGuide } = guideContext

  success(`${successEmoji} ${chalk.bold('Congratulations!')} The guide is now completed.`)
  log()
  log(`You can navigate to your ${activeGuide.name} by running: ${codeStyle(`cd ${relative(process.cwd(), installationDirectory)}`)}`)
  log()
  try {
    const whatsNextText = await readFile(join(installationDirectory, 'WHATS-NEXT.MD'))
    log(frame(markdown(whatsNextText.toString()).trim()))
  } catch (e) { }
}

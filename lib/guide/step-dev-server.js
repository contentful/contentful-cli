import execa from 'execa'
import opn from 'opn'
import treeKill from 'tree-kill'

import { log, wrappedLog, logError } from '../utils/log'
import { separator } from '../utils/text'
import { highlightStyle, codeStyle, pathStyle } from '../utils/styles'
import { generateNumberEmoji } from '../utils/emojis'
import { confirmation } from '../utils/actions'

import { GUIDE_MAX_WIDTH, AbortedError } from './helpers'

export default async function devServerStep (guideContext) {
  guideContext.stepCount++
  const { installationDirectory, activeGuide, stepCount } = guideContext
  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Run the website in development mode on your machine`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(`${highlightStyle('Almost done!')} Your ${activeGuide.name} has been set up on your local machine. It will now be started by running: ${codeStyle(`${activeGuide.devExecutable} ${activeGuide.devParameters.join(' ')}`)}`)
  log()
  wrappedLog(`A browser will open showing your new ${activeGuide.name}. Feel free to make changes to the code and see them appear immediatly.`, GUIDE_MAX_WIDTH)
  log()
  wrappedLog(`You may exit development mode by pressing the Q or CTRL+C`, GUIDE_MAX_WIDTH)

  const confirmDevServer = await confirmation(`Run ${activeGuide.name} locally in development mode now?`)
  log()

  if (!confirmDevServer) {
    throw new AbortedError()
  }

  const task = execa(activeGuide.devExecutable, activeGuide.devParameters, {
    cwd: installationDirectory
  })
  let errorThrown = true

  task.stdout.pipe(process.stdout)

  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  if ('setRawMode' in process.stdin) {
    process.stdin.setRawMode(true)
  }

  const killer = (key) => {
    if (['\u0003', 'q', 'Q'].includes(key)) {
      errorThrown = false
      treeKill(task.pid)
    }
  }

  process.stdin.on('data', killer)

  try {
    // Open dev server as soon the first build finished
    const opener = (data) => {
      const str = data.toString()
      if (activeGuide.devBrowserOpenRegex.test(str)) {
        // We open the browser window only on Windows and OSX since this might fail or open the wrong browser on Linux.
        if (['win32', 'darwin'].includes(process.platform)) {
          opn(activeGuide.devURI, {
            wait: false
          })
        } else {
          log(`You can find the running website at ${pathStyle(activeGuide.devURI)}`)
        }

        task.stdout.removeListener('data', opener)
      }
    }
    task.stdout.on('data', opener)
    await task
  } catch (err) {
    // Log error only when process got not killed by user
    if (errorThrown) {
      logError(err)
    }
  } finally {
    process.stdin.removeListener('data', killer)
    if ('setRawMode' in process.stdin) {
      process.stdin.setRawMode(false)
    }
    process.stdin.pause()
  }
}

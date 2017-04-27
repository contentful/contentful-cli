import spaceImport from 'contentful-import'
import { createClient } from 'contentful-management'

import { getContext } from '../../context'
import { confirmation } from '../../utils/actions'
import { log, info, success, logError } from '../../utils/log'
import { successEmoji } from '../../utils/emojis'
import { checkLoggedIn, checkSpaceIdProvided } from '../../utils/validators'

import blog from '../../seeds/blog.js'

const seeds = {
  blog
}

export const command = 'seed'
export const desc = 'Seed a content model and content based on given templates'

export const builder = (yargs) => {
  return yargs
    .example('contentful space seed --type blog')
    .demandCommand(2)
    .option('type', {
      alias: 't',
      describe: 'The type of the seed (currently only blog supported)',
      demandOption: true,
      choices: Object.keys(seeds)
    })
    .option('spaceId', {
      alias: 's',
      describe: 'ID of the space to seed the data to'
    })
}

export const handler = async function seed (argv) {
  try {
    await checkLoggedIn()
    await checkSpaceIdProvided(argv)
  } catch (err) {
    log(err.message)
    return
  }
  try {
    const context = await getContext()
    const client = createClient({
      accessToken: context.cmaToken
    })
    const spaceId = argv.spaceId || context.activeSpaceId
    const space = await client.getSpace(spaceId)

    info(`You are about import the ${argv.type} template to your ${space.name} (${space.sys.id}) space. Existing content might be overwritten.`)

    await confirmation('Are your ready to seed the space?')

    await spaceImport({
      content: seeds[argv.type],
      spaceId,
      managementToken: context.cmaToken
    })

    success(`${successEmoji}`)
  } catch (err) {
    logError(err)
  }
}

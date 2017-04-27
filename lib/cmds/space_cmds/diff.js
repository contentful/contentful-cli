import {createClient} from 'contentful-management'
import {getContext} from '../../context'
import {error} from '../../utils/log'
import {diffJson} from 'diff'
import Listr from 'listr'
import chalk from 'chalk'
export const command = 'diff'

export const desc = 'diffing the content models of the current space and a target space'

export const builder = (yargs) => {
  return yargs.options('target-space', {
    type: 'string',
    demand: true
  })
}

export const handler = async (argv) => {
  const context = await getContext()
  if (!context.cmaToken || !context.activeSpaceId) {
    error('Please log in first, and set an active space using `contentful space use <space-id>`')
    return
  }
  const client = createClient({accessToken: context.cmaToken,
    headers: {'X-Contentful-Skip-Transformation': true}
  })

  const tasks = new Listr([{
    title: `Generating diff between space ${context.spaceId} and ${argv.targetSpace}`,
    task: (ctx) => {
      return new Listr([
        {
          title: `Getting contentTypes from space ${context.activeSpaceId}`,
          task: async () => {
            const currentSpace = await client.getSpace(context.activeSpaceId)
            ctx.currentModel = await currentSpace.getContentTypes()
          }
        },
        {
          title: `Getting contentTypes from space ${argv.targetSpace}`,
          task: async () => {
            const targetSpace = await client.getSpace(argv.targetSpace)
            ctx.targetModel = await targetSpace.getContentTypes()
          }
        },
        {
          title: `Computing diff`,
          task: () => {
            const diffData = diffJson(ctx.currentModel.toPlainObject(), ctx.targetModel.toPlainObject())
            diffData.forEach((part) => {
              if (part.added) {
                console.log(chalk.green(part.value))
              } else if (part.removed) {
                console.log(chalk.red(part.value))
              } else {
                console.log(part.value)
              }
            })
          }
        }
      ])
    }
  }])
  return tasks.run()
}

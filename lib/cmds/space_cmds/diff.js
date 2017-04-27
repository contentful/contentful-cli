import {createClient} from 'contentful-management'
import {getContext} from '../../context'
import {error} from '../../utils/log'
import {diffJson} from 'diff'
import Listr from 'listr'
import chalk from 'chalk'

export const command = 'diff'

export const desc = 'Diffing the content models of the current space and a target space'

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
  const {activeSpaceId, cmaToken} = context
  const client = createClient({accessToken: cmaToken,
    headers: {'X-Contentful-Skip-Transformation': true}
  })
  const tasks = new Listr([{
    title: `Generating diff between space ${activeSpaceId} and ${argv.targetSpace}`,
    task: (ctx) => {
      return new Listr([
        {
          title: `Getting contentTypes from space ${activeSpaceId}`,
          task: async () => {
            const currentSpace = await client.getSpace(activeSpaceId)
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
            ctx.currentModel.toPlainObject().items
            .map(currCt => {
              const counterPart = ctx.targetModel.toPlainObject().items.find(ct => ct.sys.id === currCt.sys.id)
              return {
                diff: diffJson(counterPart || '', currCt),
                name: currCt.name
              }
            })
            .forEach(ct => {
              console.log(ct.name)
              ct.diff.forEach(part => {
                if (part.added) {
                  console.log(chalk.green(part.value))
                } else if (part.removed) {
                  console.log(chalk.red(part.value))
                } else {
                  console.log(part.value)
                }
              })
            })
          }
        }
      ])
    }
  }])
  return tasks.run()
}

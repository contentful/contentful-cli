import {createClient} from 'contentful-management'
import {getContext} from '../../context'
import {error} from '../../utils/log'
import {diffJson} from 'diff'
import Listr from 'listr'
import chalk from 'chalk'
import {frame} from '../../utils/text'
import _ from 'lodash'

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
            const currModel = ctx.currentModel.toPlainObject().items
            const targetModel = ctx.targetModel.toPlainObject().items

            const deletedItems = _.differenceWith(targetModel, currModel, (x, y) => x.sys.id === y.sys.id)

            ctx.diff = currModel.map(currCt => {
              const counterPart = targetModel.find(ct => ct.sys.id === currCt.sys.id)
              return {
                name: currCt.name,
                diff: diffJson(counterPart || '', currCt)
              }
            })

            ctx.diff.concat(deletedItems.map(ct => {
              return {
                name: ct.name,
                diff: diffJson(ct, '')}
            }))
          }
        }
      ])
    }
  }])
  return tasks.run().then(ctx => {
    renderDiff(ctx.diff)
  })
}

function renderDiff (diff) {
  diff.forEach(ct => {
    const ctLines = []
    ctLines.push(ct.name)
    ct.diff.forEach(part => {
      if (part.added) {
        ctLines.push(chalk.green(part.value))
      } else if (part.removed) {
        ctLines.push(chalk.red(part.value))
      }
    })
    frame(ctLines.join('\n'))
  })
}

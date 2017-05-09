import {createClient} from 'contentful-management'
import {error} from '../../utils/log'
import fs from 'fs'
import {getContext} from '../../context'
import {getPatchesAndDiff, renderDiff} from './diff/'
import Listr from 'listr'
import {resolve} from 'path'

export const command = 'diff'
export const desc = 'Diffing the content models of the current space and a target space'

export const builder = (yargs) => {
  return yargs
    .options('target-space', {
      type: 'string',
      describe: 'Target space to check against',
      demand: true
    })
    .options('generate-patch', {
      type: 'boolean',
      describe: 'Generate patch file along with the diffing',
      default: false
    })
    .options('patch-dir', {
      type: 'string',
      describe: 'Directory to save the patch files to',
      default: process.cwd()
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
            const patchesAndDiff = getPatchesAndDiff(currModel, targetModel)

            Object.assign(ctx, patchesAndDiff)
          }
        },
        {
          title: 'Writing diff files',
          task: () => {
            return new Listr(ctx.patches.map((ctPatch) => {
              const fullFilePath = resolve(argv.patchDir, `${ctPatch.name}.json`)
              return {
                title: `${ctPatch.name} --> ${fullFilePath}`,
                task: () => {
                  fs.writeFileSync(fullFilePath, JSON.stringify(ctPatch.patches, null, 4))
                },
                skip: () => ctPatch.patches.length === 0
              }
            }))
          },
          skip: () => !argv.generatePatch
        }
      ])
    }
  }], {
    collapse: false
  })
  return tasks.run().then(ctx => {
    renderDiff(ctx.diff)
  })
}

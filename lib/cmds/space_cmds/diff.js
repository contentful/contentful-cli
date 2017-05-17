import {assertLoggedIn, assertSpaceIdProvided} from '../../utils/assertions'
import {createClient} from 'contentful-management'
import fs from 'fs'
import slug from 'slug'
import {getContext} from '../../context'
import {getPatchesAndDiff} from './diff/diff-patch-data'
import {renderDiff} from './diff/render-diff'
import Listr from 'listr'
import {resolve} from 'path'
import {handleAsyncError as handle} from '../../utils/async.js'
export const command = 'diff'
export const desc = 'Diffing the content models of the current space and a target space'

export const builder = (yargs) => {
  return yargs
    .options('space-id', {
      type: 'string',
      describe: 'Source space to check against the target space'
    })
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
export const diffct = async (argv) => {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)
  const {activeSpaceId, cmaToken} = await getContext()
  const spaceId = argv.spaceId || activeSpaceId
  const client = createClient({accessToken: cmaToken,
    headers: {'X-Contentful-Skip-Transformation': true}
  })
  const tasks = new Listr([{
    title: `Generating diff between space ${spaceId} and ${argv.targetSpace}`,
    task: (ctx) => {
      return new Listr([
        {
          title: `Getting contentTypes from space ${spaceId}`,
          task: async () => {
            const currentSpace = await client.getSpace(spaceId)
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
              const fullFilePath = resolve(argv.patchDir, `${slug(ctPatch.name)}.json`)
              return {
                title: `${ctPatch.name} --> ${fullFilePath}`,
                task: () => {
                  fs.writeFileSync(fullFilePath, JSON.stringify({
                    id: ctPatch.id,
                    patches: ctPatch.patches
                  }, null, 4))
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

export const handler = handle(diffct)

import inquirer from 'inquirer'

import { readFile, readdir } from 'fs'
import { resolve, join } from 'path'

import { promisify } from 'bluebird'
import jsonpatch from 'fast-json-patch'

import { renderContentTypeDiff } from '../../diff-patch/render-diff'
import { getDiffDataForPatch } from '../../diff-patch/get-patch-data'
import * as actions from '../../../utils/actions'

const read = promisify(readFile)
const readDir = promisify(readdir)

export async function readPatchFile (migrationFile) {
  const buffered = await read(resolve(process.cwd(), migrationFile))
  return JSON.parse(buffered.toString())
}

export async function readPatchDir (dir) {
  return readDir(resolve(process.cwd(), dir))
    .filter(fileName => fileName.startsWith('contentful-patch-'))
    .map(fileName => join(dir, fileName))
}

export function transformPath (contentType, path) {
  if (!contentType.fields) {
    return path
  }

  const FIELD_ID = /^\/fields\/([^/]+)\//
  const [, match] = path.match(FIELD_ID) || []

  const potentialIndex = parseInt(match, 10)

  if (!Number.isNaN(potentialIndex)) {
    return path
  }

  const pathId = match
  const index = contentType.fields.findIndex(({ id }) => id === pathId)

  return path.replace(FIELD_ID, (match, fieldId) => {
    return match.replace(fieldId, index)
  })
}

export function transformError (error) {
  if (error.name === 'OPERATION_PATH_CANNOT_ADD') {
    return {
      id: 'ArrayIndexNotExist',
      message: `The operation "${JSON.stringify(error.operation)}" specified an invalid index`
    }
  }
  return error
}

export function applyPatch (contentType, patch) {
  try {
    jsonpatch.apply(contentType, [patch], true)
  } catch (e) {
    throw transformError(e)
  }
}

export async function confirmPatch () {
  const { applyPatch } = await inquirer.prompt([{
    type: 'confirm',
    name: 'applyPatch',
    message: 'Do you want to apply this patch?',
    default: true
  }])

  return applyPatch
}

export async function confirm (message) {
  return actions.confirmation(message)
}

export function hasChanged (patchedContentType, sourceContentType) {
  return getDiffDataForPatch(patchedContentType, sourceContentType).diff
    .some(chunk => chunk.added || chunk.removed)
}

export function prettyDiff (sourceContentType, patchedContentType) {
  renderContentTypeDiff(getDiffDataForPatch(patchedContentType, sourceContentType))
}

import {diffJson} from 'diff'
import { flatten } from 'lodash'

import patchUtils from '../../utils/patches'

const isFieldPath = (path) => /^\/fields\/[^/]+$/.test(path)
const isRemove = (op) => op === 'remove'

export function getDiffDataForPatch (tmp, target) {
  return {
    name: tmp.name,
    diff: diffJson(target, tmp).filter(part => part.value !== '{}')
  }
}

export function getPatchData (first, second) {
  const [base, target] = patchUtils.cleanupModels([first, second])

  const changes = patchUtils.compareAsObject(base, target)
  const deletions = changes.filter(({ op, path }) => isRemove(op) && isFieldPath(path))
  const other = changes.filter(({ op, path }) => !isFieldPath(path))

  // Only append to fields
  const additions = changes
    .filter(({ op, path }) => op === 'add' && isFieldPath(path))
    .map((patch) => ({ ...patch, path: '/fields/-' }))

  // Restore the wanted fields order by moving added fields to proper position
  const baseFieldsOrder = patchUtils.fields(base).map(({ id }) => id)
  const targetFieldsOrder = patchUtils.fields(target).map(({ id }) => id)
  const currentFieldsOrder = patchUtils.getCurrentFieldsOrder(baseFieldsOrder, deletions, additions)
  const moves = patchUtils.getMovePatches(currentFieldsOrder, targetFieldsOrder)

  const patches = [...additions, ...other, ...deletions, ...moves]

  return normalizePatches(patches)
}

function normalizePatches (data) {
  const result = data.map((currentPatch) => {
    // path examples to match `/fields/0` or `/fields/-`
    if (currentPatch.op === 'remove' && currentPatch.path.match(/^\/fields\/(?:[^/]+)$/)) {
      return [
        {op: 'replace', path: `${currentPatch.path}/omitted`, value: true},
        {op: 'add', path: `${currentPatch.path}/deleted`, value: true}
      ]
    }
    return currentPatch
  })
  return flatten(result)
}

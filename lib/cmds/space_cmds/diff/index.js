import chalk from 'chalk'
import {diffJson} from 'diff'
import emojic from 'emojic'
import {omit, differenceWith} from 'lodash'
import {frame} from '../../../utils/text'
import jsonpatch from 'fast-json-patch'

const removeForDiff = [
  'sys',
  'version',
  'firstPublishedAt',
  'publishedAt',
  'publishedBy',
  'publishedCounter',
  'publishedVersion',
  'updatedAt',
  'updatedBy'
]

export function renderDiff (diff) {
  let emptyDiff = true
  diff.forEach(ct => {
    const ctLines = [ct.name]
    ct.diff.forEach((part, i, parts) => {
      const { added, removed } = part
      if (!added && !removed) {
        return null
      }
      const { before, after } = getDiffBoundaries(parts, i)
      const color = added ? 'green' : 'red'

      ctLines.push(`${before}${chalk[color](part.value)}${after}`)
    })

    if (ctLines.length === 1) {
      return
    }
    emptyDiff = false
    frame(ctLines.join('\n'))
  })
  if (emptyDiff) {
    frame(`${emojic.sparkles}  Your content types are identical ${emojic.sparkles}`)
  }
}

function getDiffOrPatchData (first, second, compareFn) {
  let cleaned = [first, second].map(item => {
    if (typeof item === 'object') {
      return omit(item, removeForDiff)
    }
    return item
  })

  const comparedData = compareFn(...cleaned)

  if (compareFn === jsonpatch.compare) {
    normalizePatches(comparedData)
  }
  return comparedData
}

function normalizePatches (data) {
  const arr = data.slice()
  arr.forEach((currentPatch) => {
    if (currentPatch.op === 'remove' && currentPatch.path.match(/^\/fields\/(?:\d+|-)$/)) {
      const i = data.indexOf(currentPatch) // index may change if we inserted an extra item before
      data.splice(i, 0, {op: 'replace', path: `${currentPatch.path}/omitted`, value: true})
    }
  })
}

function getDiffBoundaries (parts, i) {
  const partBefore = determineBoundary(parts[i - 1])
  const partAfter = determineBoundary(parts[i + 1])

  const before = partBefore.value.slice(-100)
  const after = partAfter.value.slice(0, 100)

  return { before, after }
}

function determineBoundary (part) {
  if (part && !(part.added || part.removed)) {
    return part
  }
  // when a neighboring part is also changed, we don't want to use it as a context boundary
  return { value: '' }
}

export function getPatchesAndDiff (currModel, targetModel) {
  const deletedItems = differenceWith(targetModel, currModel, (x, y) => x.sys.id === y.sys.id)
  const patches = []
  const diff = []

  currModel.forEach(currCt => {
    const counterPart = targetModel.find(ct => ct.sys.id === currCt.sys.id)
    patches.push({
      name: currCt.name,
      patches: getDiffOrPatchData(counterPart || {}, currCt, jsonpatch.compare)
    })
    diff.push({
      name: currCt.name,
      diff: getDiffOrPatchData(counterPart || '', currCt, diffJson)
    })
  })

  deletedItems.forEach(deletedCt => {
    patches.push({
      name: deletedCt.name,
      patches: getDiffOrPatchData(deletedCt, {}, jsonpatch.compare)
    })
    diff.push({
      name: deletedCt.name,
      diff: getDiffOrPatchData(deletedCt, '', diffJson)
    })
  })

  return { diff, patches }
}

import chalk from 'chalk'
import {diffJson} from 'diff'
import emojic from 'emojic'
import {omit} from 'lodash'
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
    frame(`${emojic.sparkles}  Your contentTypes are identical ${emojic.sparkles}`)
  }
}

export function getDiffData (first, second) {
  let cleaned = [first, second].map(item => {
    if (typeof item === 'object') {
      return omit(item, removeForDiff)
    }
    return item
  })
  return diffJson(...cleaned)
}

export function getPatchData (first, second) {
  let cleaned = [first, second].map(item => {
    if (typeof item === 'object') {
      return omit(item, removeForDiff)
    }
    return item
  })
  return jsonpatch.compare(...cleaned)
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

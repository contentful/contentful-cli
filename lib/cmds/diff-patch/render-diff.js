import chalk from 'chalk'
import emojic from 'emojic'
import _ from 'lodash'
import {frame} from '../../utils/text'
import {log} from '../../utils/log'

const contextLines = 4
const changeChunkDelimiter = '\n' + '-'.repeat(30) + '\n\n'

export function renderModelDiff (diff) {
  const diffNotEmpty = diff.some(renderContentTypeDiff)
  if (!diffNotEmpty) {
    log(frame(`${emojic.sparkles}  Your content types are identical ${emojic.sparkles}`))
  }
}

export function renderContentTypeDiff (ct) {
  // the diff data consists of unchanged, added and removed parts
  // for better readability, we group pairs of additions and removals
  // and add unchanged lines of context around them
  const getDiffBoundaries = resetDetectionOfFirstChunk(contextLines, changeChunkDelimiter)
  const ctLines = [ct.name + '\n\n']
  ct.diff.forEach((part, i, parts) => {
    const { added, removed } = part
    if (!added && !removed) {
      return null
    }
    const { before, after } = getDiffBoundaries(parts, i)
    const color = added ? 'green' : 'red'
    ctLines.push(before, chalk[color](part.value), after)
  })

  if (ctLines.length === 1) {
    return
  }
  log(frame(ctLines.filter(part => part !== null).join('')))
}

export function resetDetectionOfFirstChunk (contextLines, chunkDelimiter) {
  // we want to prepend a change chunk with a delimiter once we are past the first chunk
  let isFirstChunk = true
  return function (parts, i) {
    // get the preceding and subsequent unchanged part, if they exist
    let partBefore = determineBoundary(parts[i - 1])
    let before = partBefore ? getLinesForContext(partBefore.value, contextLines * -1) : partBefore
    if (partBefore && !isFirstChunk) before = chunkDelimiter + before
    isFirstChunk = false

    const partAfter = determineBoundary(parts[i + 1])
    const after = partAfter ? getLinesForContext(partAfter.value, contextLines) : partAfter

    return { before, after }
  }
}

function determineBoundary (part) {
  if (part && !(part.added || part.removed)) {
    return part
  }
  // when a neighboring part is also changed, we don't want to use it as a context boundary
  return null
}

function getLinesForContext (string, n) {
  const args = n < 0 ? [n] : [0, n]
  string = _.trim(string, '\n')
  return string.split('\n').slice(...args).join('\n') + '\n'
}

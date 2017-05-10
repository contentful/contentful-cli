import chalk from 'chalk'
import emojic from 'emojic'
import {frame} from '../../../utils/text'
import {log} from '../../../utils/log'

const contextLength = 100
const changeChunkDelimiter = '\n' + '-'.repeat(30) + '\n\n'

export function renderDiff (diff) {
  let emptyDiff = true
  diff.forEach(ct => {
    // the diff data consists of unchanged, added and removed parts
    // for better readability, we group pairs of additions and removals
    // and add unchanged lines of context around them
    const getDiffBoundaries = resetDetectionOfFirstChunk(contextLength, changeChunkDelimiter)
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
    emptyDiff = false
    log(frame(ctLines.filter(part => part !== null).join('')))
  })
  if (emptyDiff) {
    log(frame(`${emojic.sparkles}  Your content types are identical ${emojic.sparkles}`))
  }
}

export function resetDetectionOfFirstChunk (contextLength, chunkDelimiter) {
  // we want to prepend a change chunk with a delimiter once we are past the first chunk
  let isFirstChunk = true
  return function (parts, i) {
    // get the preceding and subsequent unchanged part, if they exist
    let partBefore = determineBoundary(parts[i - 1])
    let before = partBefore ? partBefore.value.slice(-contextLength) : partBefore
    if (partBefore && !isFirstChunk) before = chunkDelimiter + before
    isFirstChunk = false

    const partAfter = determineBoundary(parts[i + 1])
    const after = partAfter ? partAfter.value.slice(0, contextLength) : partAfter

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

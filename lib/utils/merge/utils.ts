import type { Operation } from './types'
import { ContentTypeProps } from 'contentful-management'

export const getChangeKey = (operation: Operation): string => {
  const parts = operation.path.split('/')
  return parts[parts.length - 1]
}

export const getFieldIdForIndex = (
  model: ContentTypeProps[],
  contentTypeId: string,
  index: number
): string => {
  const matchedContentType = model.find(
    contentType => contentType.sys.id === contentTypeId
  )
  if (matchedContentType && matchedContentType.fields.length > index) {
    return matchedContentType.fields[index].id
  }
  return 'unknown'
}

export const fieldIndex = (path: string): number => {
  if (!path.startsWith('/fields')) {
    return -1
  }
  return parseInt(path.split('/')[2])
}

export const fieldChange = (operation: Operation): string => {
  if (!operation.path.startsWith('/fields')) {
    return ''
  }
  return operation.path.split('/')[3]
}

// Util functions for move operations

export const isNestedMoveOperation = (operation: Operation): boolean => {
  return (
    operation.op === 'move' &&
    operation.path.split('/').filter(x => x !== '').length > 2
  )
}

export const getLastIndexFromPath = (path: string): number => {
  const stringIndex = path.split('/').pop() as string
  const lastIndex = parseInt(stringIndex, 10)
  if (isNaN(lastIndex)) {
    return -1
  }
  return lastIndex
}

export const getNestedPropertyNames = (operation: Operation) =>
  operation.path
    .split('/')
    // we want any property that is within fields, we filter out indices
    .filter(x => x !== 'fields' && x !== '' && isNaN(parseInt(x, 10)))

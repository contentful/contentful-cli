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

export const isNestedMoveOperation = (operation: Operation): boolean => {
  return (
    operation.op === 'move' &&
    operation.path.split('/').filter(x => x !== '').length > 2
  )
}

export const getLastIndexFromPath = (path: string) => {
  const stringIndex = path.split('/').pop() as string
  return parseInt(stringIndex, 10) || 0
}

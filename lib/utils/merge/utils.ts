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

export const fieldIndex = (operation: Operation): number => {
  if (!operation.path.startsWith('/fields')) {
    return -1
  }
  return parseInt(operation.path.split('/')[2])
}

export const fieldChange = (operation: Operation): string => {
  if (!operation.path.startsWith('/fields')) {
    return ''
  }
  return operation.path.split('/')[3]
}

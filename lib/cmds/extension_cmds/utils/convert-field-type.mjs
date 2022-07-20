import { findKey } from 'lodash'

const collectionNames = {
  Symbol: 'Symbols',
  Asset: 'Assets',
  Entry: 'Entries'
}

export function getFieldType(name) {
  switch (name) {
    case 'Assets':
    case 'Entries':
      return {
        type: 'Array',
        items: { type: 'Link', linkType: getSingular(name) }
      }
    case 'Symbols':
      return { type: 'Array', items: { type: getSingular(name) } }
    case 'Asset':
    case 'Entry':
      return { type: 'Link', linkType: name }
    default:
      return { type: name }
  }
}

export function getDisplayName(fieldType) {
  switch (fieldType.type) {
    case 'Array':
      return getCollectionName(fieldType)
    case 'Link':
      return fieldType.linkType
    default:
      return fieldType.type
  }
}

function getSingular(name) {
  return findKey(collectionNames, val => {
    return val === name
  })
}

function getCollectionName({ items: { type, linkType } }) {
  return collectionNames[linkType || type]
}

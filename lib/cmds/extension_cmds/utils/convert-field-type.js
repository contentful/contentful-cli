const { findKey, isObject } = require('lodash')

const collectionNames = {
  Symbol: 'Symbols',
  Asset: 'Assets',
  Entry: 'Entries'
}

function getFieldType(type) {
  if (isObject(type)) {
    return type
  }

  switch (type) {
    case 'Assets':
    case 'Entries':
      return {
        type: 'Array',
        items: { type: 'Link', linkType: getSingular(type) }
      }
    case 'Symbols':
      return { type: 'Array', items: { type: getSingular(type) } }
    case 'Asset':
    case 'Entry':
      return { type: 'Link', linkType: type }
    default:
      return { type }
  }
}

module.exports.getFieldType = getFieldType

function getDisplayName(fieldType) {
  switch (fieldType.type) {
    case 'Array':
      return getCollectionName(fieldType)
    case 'Link':
      return fieldType.linkType
    default:
      return fieldType.type
  }
}

module.exports.getDisplayName = getDisplayName

function getSingular(name) {
  return findKey(collectionNames, val => {
    return val === name
  })
}

function getCollectionName({ items: { type, linkType } }) {
  return collectionNames[linkType || type]
}

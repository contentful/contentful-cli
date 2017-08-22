export function getDisplayName (fieldType) {
  switch (fieldType.type) {
    case 'Array':
      return getCollectionName(fieldType)
    case 'Link':
      return fieldType.linkType
    default:
      return fieldType.type
  }
}

function getCollectionName ({ items: { type, linkType } }) {
  const collectionName = {
    'Symbol': 'Symbols',
    'Asset': 'Assets',
    'Entry': 'Entries'
  }

  return collectionName[linkType || type]
}

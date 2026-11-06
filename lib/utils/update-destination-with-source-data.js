module.exports = function updateDestinationWithSourceData (source, destination) {
  const type = source.sys.type

  if (type === 'Entry') {
    destination.fields = source.fields
  } else if (type === 'Asset') {
    destination.fields = source.fields
    destination.sys.title = source.sys.title
  } else if (type === 'Tag') {
    destination.name = source.name
  } else {
    throw new Error(`Unsupported entity type: ${type}`)
  }

  return destination
}
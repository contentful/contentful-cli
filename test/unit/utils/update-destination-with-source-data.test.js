const updateDestinationWithSourceData = require('../../lib/utils/update-destination-with-source-data')
const assert = require('assert')

describe('updateDestinationWithSourceData', () => {
  it('updates Tag entity', () => {
    const source = { sys: { type: 'Tag' }, name: 'new-tag-name' }
    const destination = { sys: { type: 'Tag' }, name: 'old-tag-name' }
    const result = updateDestinationWithSourceData(source, destination)
    assert.strictEqual(result.name, 'new-tag-name')
  })

  it('throws error for unsupported type', () => {
    const source = { sys: { type: 'Unknown' } }
    const destination = { sys: { type: 'Unknown' } }
    assert.throws(() => updateDestinationWithSourceData(source, destination), /Unsupported entity type: Unknown/)
  })
})
import _ from 'lodash'

class ContentType {
  constructor () {
    const defaults = {
      name: 'CT',
      fields: [
        { id: 'internalId', apiName: 'id', name: 'Title', type: 'Symbol' }
      ]
    }

    _.extend(this, defaults)
  }

  update () {}

  toPlainObject () {
    return _.pick(this, ['name', 'fields'])
  }
}

export default function () {
  return new ContentType()
}

import _ from 'lodash'
import Bluebird from 'bluebird'

class ContentType {
  constructor (overrides) {
    const defaults = {
      name: 'CT',
      fields: [
        { id: 'internalId', apiName: 'id', name: 'Title', type: 'Symbol' }
      ]
    }

    _.extend(this, defaults, overrides)
  }

  update () {
    return Bluebird.resolve(this)
  }

  publish () {
    return Bluebird.resolve(this)
  }

  toPlainObject () {
    return _.pick(this, ['name', 'fields', 'description', 'sys'])
  }
}

export default function (overrides) {
  return new ContentType(overrides)
}

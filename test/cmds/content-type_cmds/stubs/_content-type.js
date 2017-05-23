import _ from 'lodash'
import Bluebird from 'bluebird'

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

  update () {
    return Bluebird.resolve(this)
  }

  publish () {
    return Bluebird.resolve(this)
  }

  toPlainObject () {
    return _.pick(this, ['name', 'fields'])
  }
}

export default function () {
  return new ContentType()
}

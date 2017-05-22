// Use symbols to makeMake proxy properties private
const _id = Symbol('id')
const _space = Symbol('space')
const _data = Symbol('data')
const _contentType = Symbol('contenType')

class ContentTypeProxy {
  constructor (id, space) {
    this[_id] = id
    this[_space] = space
    this[_data] = { fields: [] }
    this[_contentType] = undefined

    return new Proxy(this, {
      get: (target, property) => {
        if (property in target) {
          return target[property]
        }

        const receiver = this[_contentType] ? this[_contentType] : this[_data]

        return receiver[property]
      },
      set: (target, property, value) => {
        if (property in target) {
          target[property] = value
          return true
        }

        const receiver = this[_contentType] ? this[_contentType] : this[_data]
        receiver[property] = value

        return true
      }
    })
  }

  toPlainObject () {
    return this[_data]
  }

  async update () {
    if (this[_contentType]) {
      return this[_contentType].update()
    }

    this[_contentType] = await this[_space].createContentTypeWithId(this[_id], this[_data])
  }
}

export default ContentTypeProxy

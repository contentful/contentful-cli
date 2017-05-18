class ContentTypeProxy {
  constructor (id, space) {
    this.id = id
    this.space = space
    this.data = { fields: [] }
    this.contentType = undefined

    return new Proxy(this, {
      get: (target, property) => {
        if (property in target) {
          return target[property]
        }

        const receiver = this.contentType ? this.contentType : this.data

        return receiver[property]
      },
      set: (target, property, value) => {
        if (property in target) {
          target[property] = value
          return true
        }

        const receiver = this.contentType ? this.contentType : this.data
        receiver[property] = value

        return true
      }
    })
  }

  toPlainObject () {
    return this.data
  }

  async update () {
    if (this.contentType) {
      return this.contentType.update()
    }

    this.contentType = await this.space.createContentTypeWithId(this.id, this.data)
  }
}

export default ContentTypeProxy

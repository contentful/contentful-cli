class UnknownActionError extends Error {
  constructor (action) {
    super()

    this.name = 'UnknownAction'
    this.message = `Unknown action "${action}"`
  }
}

export default UnknownActionError

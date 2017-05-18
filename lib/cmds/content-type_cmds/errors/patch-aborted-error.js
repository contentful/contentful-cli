class PatchAbortedError extends Error {
  constructor () {
    super()

    this.name = 'PatchAborted'
    this.message = 'Patch application has been aborted'
  }
}

export default PatchAbortedError

const { resolve } = require('path')

const { readFileP } = require('../../../utils/fs')

module.exports = async function readSrcDocFile(extension) {
  const path = resolve(extension.srcdoc)
  const content = await readFileP(path)
  extension.srcdoc = content.toString()
}

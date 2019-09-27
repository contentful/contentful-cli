const fs = require('fs')
const { promisify } = require('util')

const accessP = promisify(fs.access)
const mkdirP = promisify(fs.mkdir)

module.exports.writeFileP = promisify(fs.writeFile)
module.exports.readFileP = promisify(fs.readFile)

async function ensureDir(dirPath) {
  try {
    await accessP(dirPath)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }

    await mkdirP(dirPath)
  }
}

module.exports.ensureDir = ensureDir

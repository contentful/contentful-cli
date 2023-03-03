const fs = require('fs')
const { promisify } = require('util')
const { isAbsolute, resolve } = require('path')

const accessP = promisify(fs.access)
const mkdirP = promisify(fs.mkdir)

module.exports.writeFileP = promisify(fs.writeFile)
module.exports.readFileP = promisify(fs.readFile)

module.exports.currentDir = () => process.cwd()

function getPath(path) {
  if (isAbsolute(path)) {
    return path
  }

  return resolve(module.exports.currentDir(), path)
}

module.exports.getPath = getPath

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

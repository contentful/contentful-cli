const fs = require('fs');
const Bluebird = require('bluebird');

const accessP = Bluebird.promisify(fs.access)
const mkdirP = Bluebird.promisify(fs.mkdir)

module.exports.writeFileP = Bluebird.promisify(fs.writeFile)
module.exports.readFileP = Bluebird.promisify(fs.readFile)

export async function ensureDir (dirPath) {
  try {
    await accessP(dirPath)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }

    await mkdirP(dirPath)
  }
}

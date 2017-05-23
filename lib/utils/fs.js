import fs from 'fs'
import Bluebird from 'bluebird'

const accessP = Bluebird.promisify(fs.access)
const mkdirP = Bluebird.promisify(fs.mkdir)

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

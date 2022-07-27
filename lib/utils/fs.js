import fs from 'fs'
import { promisify } from 'util'

const accessP = promisify(fs.access)
const mkdirP = promisify(fs.mkdir)

export const writeFileP = promisify(fs.writeFile)
export const readFileP = promisify(fs.readFile)

export async function ensureDir(dirPath) {
  try {
    await accessP(dirPath)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }

    await mkdirP(dirPath)
  }
}

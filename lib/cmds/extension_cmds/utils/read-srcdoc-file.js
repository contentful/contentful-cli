import { readFile } from 'fs'
import { resolve } from 'path'

import { promisify } from 'bluebird'

const readFileP = promisify(readFile)

export default async function readSrcDocFile (extension) {
  const path = resolve(extension.srcdoc)
  const content = await readFileP(path)
  extension.srcdoc = content.toString()
}

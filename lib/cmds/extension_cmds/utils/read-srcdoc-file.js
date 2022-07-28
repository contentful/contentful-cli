import { resolve } from 'path'
import { readFileP } from '../../../utils/fs.js'

export default async function readSrcDocFile(extension) {
  const path = resolve(extension.srcdoc)
  const content = await readFileP(path)
  extension.srcdoc = content.toString()
}

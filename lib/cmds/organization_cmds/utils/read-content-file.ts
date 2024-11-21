import path from 'path'
import { readFileP } from '../../../utils/fs'
import { cwd } from 'process'

export const readContentFile = async (contentFilePath: string) => {
  const content = await readFileP(path.resolve(cwd(), contentFilePath), 'utf8')
  return JSON.parse(content)
}

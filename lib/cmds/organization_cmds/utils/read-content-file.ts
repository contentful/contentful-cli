import path from 'path'
import { readFileP } from '../../../utils/fs'

export const readContentFile = async (contentFilePath: string) => {
  const content = await readFileP(
    path.resolve(__dirname, contentFilePath),
    'utf8'
  )
  return JSON.parse(content)
}

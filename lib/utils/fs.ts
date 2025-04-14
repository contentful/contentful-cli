import fs from 'fs'
import { promisify } from 'util'
import { isAbsolute, resolve } from 'path'

const accessP = promisify(fs.access)
const mkdirP = promisify(fs.mkdir)

export const writeFileP = promisify(fs.writeFile)
export const readFileP = promisify(fs.readFile)

export const currentDir = (): string => process.cwd()

export function getPath(path: string): string {
  if (isAbsolute(path)) {
    return path
  }

  return resolve(currentDir(), path)
}

interface NodeError extends Error {
  code?: string
}

export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await accessP(dirPath)
  } catch (e: unknown) {
    const error = e as NodeError
    if (error.code !== 'ENOENT') {
      throw e
    }

    await mkdirP(dirPath)
  }
}

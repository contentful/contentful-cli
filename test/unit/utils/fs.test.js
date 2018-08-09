import Bluebird from 'bluebird'

import * as fsUtils from '../../../lib/utils/fs'
import * as fs from 'fs'

const accessP = Bluebird.promisify(fs.access)
const rmdirP = Bluebird.promisify(fs.rmdir)
const mkdirP = Bluebird.promisify(fs.mkdir)

test('ensureDir creates dir if it does not exist', async function () {
  const dirPath = '/tmp/i_hope_this_path_does_not_exist'

  try {
    await accessP(dirPath)
    expect(true).toBe(false)
  } catch (e) {
    expect(e.code).toBe('ENOENT')
  }

  try {
    await fsUtils.ensureDir(dirPath)
    await accessP(dirPath)

    expect(true).toBe(true)
  } finally {
    await rmdirP(dirPath)
  }
})

test('ensureDir does not break if called multiple times', async function () {
  const dirPath = '/tmp/some_random_path_for_tests'

  try {
    await accessP(dirPath)
    expect(true).toBe(false)
  } catch (e) {
    expect(e.code).toBe('ENOENT')
  }

  try {
    await fsUtils.ensureDir(dirPath)
    await fsUtils.ensureDir(dirPath)
    await fsUtils.ensureDir(dirPath)
    await accessP(dirPath)

    expect(true).toBe(true)
  } finally {
    await rmdirP(dirPath)
  }
})

test('ensureDir rethrows on no ENOENT errors', async function () {
  const parentDir = '/tmp/path_with_no_read_rights'
  const dirPath = '/tmp/path_with_no_read_rights/foo'

  await mkdirP(parentDir, 0)

  try {
    await fsUtils.ensureDir(dirPath)
  } catch (e) {
    expect(e.code).toBe('EACCES')
  } finally {
    await rmdirP(parentDir)
  }
})

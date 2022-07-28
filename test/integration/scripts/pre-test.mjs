import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { getConfigPath } from '../../../lib/context.js'

const setup = async () => {
  const configPath = await getConfigPath()
  const backupPath = path.join(os.homedir(), '.contentfulrc.json.backup')
  try {
    const configContent = await fs.readFile(configPath)
    console.log('Backing up config file...')
    await fs.writeFile(backupPath, configContent)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.log(`Error occurred in backing up config: ${e}`)
    }
  }
  try {
    console.log('Writing test config...')
    const testConfig = {
      managementToken: process.env.CLI_E2E_CMA_TOKEN,
      proxy: {
        host: 'localhost',
        port: 3333,
        isHttps: false
      },
      rawProxy: true
    }
    await fs.writeFile(configPath, JSON.stringify(testConfig))
  } catch (e) {
    console.log(`Error occurred in writing test config: ${e}`)
    throw e
  }
}

setup()

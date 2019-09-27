const fs = require('mz/fs')
const path = require('path')
const os = require('os')
const context = require('../../../lib/context')

const teardown = async () => {
  const configPath = await context.getConfigPath()
  const backupPath = path.join(os.homedir(), '.contentfulrc.json.backup')
  try {
    const configContent = await fs.readFile(backupPath)
    console.log('Restoring config file...')
    await fs.writeFile(configPath, configContent)
  } catch (e) {
    if (e.code === 'ENOENT') {
      // no backup existed, which means no config existed before the test? TODO what to do in this situation
      console.log('No backup, removing proxies from config...')
      const configContents = JSON.parse(await fs.readFile(configPath))
      delete configContents.proxy
      delete configContents.rawProxy
      await fs.writeFile(configPath, JSON.stringify(configContents))
    } else {
      console.log(`Error occurred in restoring up config: ${e}`)
    }
  }
}

teardown()

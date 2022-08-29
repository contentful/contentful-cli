import { writeFile, stat } from 'fs/promises'
import { resolve } from 'path'
import { homedir } from 'os'

const configFile = resolve(homedir(), '.contentfulrc.json')

export async function initConfig() {
  try {
    await stat(configFile)
  } catch (e) {
    return writeFile(
      configFile,
      JSON.stringify(
        { managementToken: process.env.CLI_E2E_CMA_TOKEN },
        null,
        4
      )
    )
  }

  const configParams = require(configFile)

  if (configParams.managementToken !== null) {
    return configParams
  }

  return writeFile(
    configFile,
    JSON.stringify({ managementToken: process.env.CLI_E2E_CMA_TOKEN }, null, 4)
  )
}

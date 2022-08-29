import { writeFile, stat, readFile } from 'fs/promises'

const configFile = process.env.CONTENTFUL_CONFIG_FILE

export async function initConfig() {
  if (!configFile)
    throw Error(
      `Please specify .contentfulrc.json path
      Set env variable CONTENTFUL_CONFIG_FILE`
    )

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

  const configParamsFile = await readFile(configFile, 'utf8')
  const configParams = JSON.parse(configParamsFile)

  if (configParams.managementToken !== null) {
    return configParams
  }

  return writeFile(
    configFile,
    JSON.stringify({ managementToken: process.env.CLI_E2E_CMA_TOKEN }, null, 4)
  )
}

import { writeFile, stat, readFile } from 'fs/promises'

const configFile = process.env.CONTENTFUL_CONFIG_FILE
const configFileError = `Please specify .contentfulrc.json path
Set env variable CONTENTFUL_CONFIG_FILE`

export const initConfig = async () => {
  if (!configFile) throw Error(configFileError)

  try {
    await stat(configFile)
  } catch (e) {
    return writeFile(
      configFile,
      JSON.stringify(
        { managementToken: process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN },
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
    JSON.stringify(
      { managementToken: process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN },
      null,
      4
    )
  )
}

import boxen from 'boxen'
import chalk from 'chalk'
import { getConfigPath, getContext } from '../context'

export const tokenInfo = async () => {
  const configFilePath = await getConfigPath()
  const { managementToken } = await getContext()

  if (!configFilePath || !managementToken) return

  console.log(
    boxen(
      `Your management token: ${chalk.dim(
        managementToken
      )} \nStored at: ${chalk.dim(configFilePath)}`,
      {
        padding: 1,
        borderStyle: 'round',
        textAlignment: 'left',
        margin: { left: 0, right: 0, top: 0.5, bottom: 0.5 },
        borderColor: 'cyan'
      }
    )
  )
}

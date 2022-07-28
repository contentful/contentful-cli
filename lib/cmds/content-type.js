import { commands } from './config_cmds/index.js'

export const command = 'content-type'
export const aliases = ['ct']

export const desc = 'Manage and list your space content types'

export const builder = function (yargs) {
  return yargs
    .command(commands)
    .demandCommand(4, 'Please specify a sub command.')
}

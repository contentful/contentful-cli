import { commands } from './config_cmds/index.mjs'

export const command = 'config'

export const desc = 'Manage and list your configs'

export const builder = function (yargs) {
  return yargs
    .command(commands)
    .demandCommand(4, 'Please specify a sub command.')
}

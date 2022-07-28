import { commands } from './environment_cmds/index.js'

export const command = 'environment'

export const desc = 'Manage and list environments'

export const builder = function (yargs) {
  return yargs
    .command(commands)
    .demandCommand(4, 'Please specify a sub command.')
}

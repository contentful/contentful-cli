import { commands } from './extension_cmds/index.js'

export const command = 'extension'

export const desc = 'Manage and list your extensions'

export const builder = function (yargs) {
  return yargs
    .command(commands)
    .demandCommand(4, 'Please specify a sub command.')
}

import { commands } from './space_cmds/index.js'

export const command = 'space'

export const desc = 'Manage and list your spaces'

export const builder = function (yargs) {
  return yargs
    .command(commands)
    .demandCommand(4, 'Please specify a sub command.')
}

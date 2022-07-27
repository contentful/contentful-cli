import { commands } from './alias_cmds/index.mjs'

export const command = 'environment-alias'

export const desc = 'Manage and list environment aliases'

export const builder = function (yargs) {
  return yargs
    .command(commands)
    .demandCommand(4, 'Please specify a sub command.')
}

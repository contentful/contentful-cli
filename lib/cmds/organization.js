import { commands } from './organization_cmds/index.js'

export const command = 'organization'

export const desc = 'Manage and list your organizations'

export const builder = function (yargs) {
  return yargs
    .usage('')
    .command(commands)
    .demandCommand(4, 'Please specify a sub command.')
}

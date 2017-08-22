export const command = 'extension'

export const desc = 'Manage and list your extensions'

export const builder = function (yargs) {
  return yargs
    .commandDir('extension_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

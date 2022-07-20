export const command = 'config'

export const desc = 'Manage and list your configs'

export const builder = function (yargs) {
  return yargs
    .commandDir('config_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

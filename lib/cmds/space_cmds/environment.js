export const command = 'environment'

export const desc = 'Manage and list your environments'

export const builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('environment_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

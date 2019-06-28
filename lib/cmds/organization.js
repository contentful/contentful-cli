export const command = 'organization'

export const desc = 'Manage and list your organizations'

export const builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('organization_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

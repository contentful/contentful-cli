export const command = 'accesstoken'

export const desc = 'Manage and list your CDA access tokens'

export const aliases = ['at']

export const builder = function (yargs) {
  return yargs
    .commandDir('accesstoken_cmds')
    .demandCommand(5, 'Please specify a sub command.')
}

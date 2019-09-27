module.exports.command = 'accesstoken'

module.exports.desc = 'Manage and list your delivery access tokens'

module.exports.aliases = ['at']

module.exports.builder = function (yargs) {
  return yargs
    .commandDir('accesstoken_cmds')
    .demandCommand(5, 'Please specify a sub command.')
}

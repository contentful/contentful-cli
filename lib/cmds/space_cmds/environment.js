module.exports.command = 'environment'

module.exports.desc = 'Manage and list environments'

module.exports.builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('environment_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

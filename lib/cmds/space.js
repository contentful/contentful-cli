module.exports.command = 'space'

module.exports.desc = 'Manage and list your spaces'

module.exports.builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('space_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

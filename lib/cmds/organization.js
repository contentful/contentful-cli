module.exports.command = 'organization'

module.exports.desc = 'Manage and list your organizations'

module.exports.builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('organization_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

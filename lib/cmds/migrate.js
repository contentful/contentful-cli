module.exports.command = 'migrate <command>'
module.exports.desc = 'Migration tools for moving Contentful data between NA and EU'
module.exports.builder = function (yargs) {
  return yargs.commandDir('migrate_cmds')
}
module.exports.handler = function () {}

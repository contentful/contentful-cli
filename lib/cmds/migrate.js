exports.command = 'migrate <command>';
exports.desc = 'Migration utilities';
exports.builder = function (yargs) {
  return yargs.commandDir('migrate_cmds');
};

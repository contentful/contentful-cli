exports.command = 'sync';
exports.desc = 'Sync a space between Contentful regions';
exports.builder = function (yargs) {
  return yargs.commandDir('sync_cmds');
};

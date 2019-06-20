import yargs from 'yargs'
import {log} from './utils/log'
import {buildContext, useFlagsIfAvailable} from './utils/middlewares'
import {version} from '../package.json'

// Workaround to remove display of script name in help. See:
// * https://github.com/yargs/yargs/pull/1143
// * https://github.com/yargs/yargs/issues/1065
// * https://github.com/yargs/yargs/issues/1048
function fixHelp (output) {
  return output.replace(/( +)contentful\.js/g, '$1')
}

yargs.usage('\nUsage: contentful <cmd> [args]')
  .commandDir('cmds')
  .middleware([
    buildContext,
    useFlagsIfAvailable
  ])
  .demandCommand(4, 'Please specify a command.')
  .help('h')
  .alias('h', 'help')
  .strict()
  .recommendCommands()
  .option('v', {
    alias: 'version',
    global: false,
    type: 'boolean',
    describe: 'Show current version',
    skipValidation: true
  })
  .version(false)
  .epilog('Copyright 2018 Contentful, this is a BETA release')
  .fail(function (msg, err, yargs) {
    if (err) throw err
    console.error(fixHelp(yargs.help()))
    console.error(msg)
    process.exit(1)
  })
  .parse(process.argv.slice(2), (_, argv, output) => {
    if (argv.help || argv.h) {
      output = fixHelp(output)
    }
    if (argv.version === true && !argv._.length) {
      log(version)
    } else {
      log(output)
    }
  })

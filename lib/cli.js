import yargs from 'yargs'
import {log} from './utils/log'
import {version} from '../package.json'

yargs.usage('\nUsage: contentful <cmd> [args]')
  .completion()
  .commandDir('cmds')
  .demandCommand(4, 'Please specify a command.')
  .help('h')
  .alias('h', 'help')
  .strict()
  .recommendCommands()
  .option('v', {
    alias: 'version',
    global: false,
    type: 'boolean',
    describe: 'Show current version'
  })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
  .parse(process.argv.slice(2), (_, argv, output) => {
    if (argv.version === true && !argv._.length) {
      log(version)
    } else {
      log(output)
    }
  })

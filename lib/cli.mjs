import yargs from 'yargs'
import { log } from './utils/log.mjs'
import {
  buildContext,
  getCommand,
  assertContext
} from './utils/middlewares.mjs'
import { commands } from './cmds/index.mjs'
import packageConfig from '../package.json' assert { type: 'json' }

yargs
  .usage('\nUsage: contentful <cmd> [args]')
  .command(commands)
  .middleware([getCommand, buildContext, assertContext])
  .scriptName('')
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
  .epilog('Copyright 2019 Contentful')
  .fail(function (msg, err, yargs) {
    if (err) throw err
    console.error(yargs.help())
    console.error(msg)
    process.exit(1)
  })
  .parse(process.argv.slice(2), (_, argv, output) => {
    if (argv.version === true && !argv._.length) {
      log(packageConfig.version)
    } else {
      log(output)
    }
  })

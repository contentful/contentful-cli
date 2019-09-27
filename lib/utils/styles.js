const chalk = require('chalk');

chalk.enabled = process.env.NODE_ENV !== 'test';

module.exports.successStyle = chalk.green;
module.exports.warningStyle = chalk.yellow;
module.exports.errorStyle = chalk.red;
module.exports.highlightStyle = chalk.cyan;
module.exports.codeStyle = chalk.dim;
module.exports.pathStyle = chalk.cyan.underline;

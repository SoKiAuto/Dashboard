const chalk = require("chalk");

const logger = {
  info: (msg) => console.log(chalk.cyan("[INFO]"), msg),
  success: (msg) => console.log(chalk.green("[SUCCESS]"), msg),
  warn: (msg) => console.log(chalk.yellow("[WARNING]"), msg),
  error: (msg) => console.log(chalk.red("[ERROR]"), msg),
};

module.exports = logger;

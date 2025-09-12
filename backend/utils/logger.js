// backend/utils/logger.js
const chalk = require("chalk");

const logger = {
  info: (...args) => {
    console.log(chalk.blue("ℹ️ [INFO]"), ...args);
  },
  success: (...args) => {
    console.log(chalk.green("✅ [SUCCESS]"), ...args);
  },
  warn: (...args) => {
    console.log(chalk.yellow("⚠️ [WARN]"), ...args);
  },
  error: (...args) => {
    console.log(chalk.red("❌ [ERROR]"), ...args);
  },
  debug: (...args) => {
    if (process.env.DEBUG === "true") {
      console.log(chalk.magenta("🐛 [DEBUG]"), ...args);
    }
  },
};

module.exports = logger;

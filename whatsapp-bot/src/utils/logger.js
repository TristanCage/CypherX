export class Logger {
  constructor(name = 'Bot') {
    this.name = name;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Format log message with timestamp
   */
  formatMessage(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}`;
  }

  /**
   * Log error
   */
  error(message) {
    if (this.levels[this.logLevel] >= this.levels.error) {
      console.error(this.formatMessage('error', message));
    }
  }

  /**
   * Log warning
   */
  warn(message) {
    if (this.levels[this.logLevel] >= this.levels.warn) {
      console.warn(this.formatMessage('warn', message));
    }
  }

  /**
   * Log info
   */
  info(message) {
    if (this.levels[this.logLevel] >= this.levels.info) {
      console.log(this.formatMessage('info', message));
    }
  }

  /**
   * Log debug
   */
  debug(message) {
    if (this.levels[this.logLevel] >= this.levels.debug) {
      console.log(this.formatMessage('debug', message));
    }
  }
}

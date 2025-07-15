const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, `${format(new Date(), 'yyyy-MM-dd')}.log`);

function log(message, level = 'info') {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;
  
  fs.appendFileSync(logFile, logMessage);
  console[level === 'error' ? 'error' : 'log'](logMessage.trim());
}

exports.info = (msg) => log(msg, 'info');
exports.warn = (msg) => log(msg, 'warn');
exports.error = (msg) => log(msg, 'error');
exports.debug = (msg) => log(msg, 'debug');
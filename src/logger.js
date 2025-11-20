import winston from 'winston';
import chalk from 'chalk';
import { mkdirSync } from 'fs';
import config from './config.js';

// Ensure logs directory exists
try {
  mkdirSync(config.logsDir, { recursive: true });
} catch (err) {
  // Ignore if already exists
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const levelColors = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.blue,
      debug: chalk.gray,
    };
    
    const colorFn = levelColors[level] || chalk.white;
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    
    return `${chalk.gray(timestamp)} ${colorFn(level.toUpperCase().padEnd(5))} ${message}${metaStr}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console output with colors
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File output for errors
    new winston.transports.File({
      filename: `${config.logsDir}/error.log`,
      level: 'error',
    }),
    // File output for all logs
    new winston.transports.File({
      filename: `${config.logsDir}/combined.log`,
    }),
  ],
});

// Helper functions for structured logging
export const logRequest = (method, url, originalKey) => {
  logger.info(chalk.cyan('📥 INCOMING REQUEST'), {
    method,
    url,
    originalKey: originalKey ? `${originalKey.substring(0, 15)}***` : 'none',
  });
};

export const logKeyReplacement = (oldKey, newKey) => {
  logger.info(chalk.green('🔄 REPLACING API KEY'), {
    oldKey: oldKey ? `${oldKey.substring(0, 15)}***` : 'none',
    newKey: `${newKey.substring(0, 15)}***`,
  });
};

export const logResponse = (statusCode, duration) => {
  const emoji = statusCode >= 200 && statusCode < 300 ? '✅' : '❌';
  const level = statusCode >= 400 ? 'warn' : 'info';
  
  logger[level](chalk.magenta(`${emoji} RESPONSE`), {
    statusCode,
    duration: `${duration}ms`,
    success: statusCode >= 200 && statusCode < 300,
  });
};

export const logError = (error, context = {}) => {
  logger.error(chalk.red('❌ ERROR'), {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logStartup = (port, apiKey) => {
  console.log('\n' + chalk.bold.cyan('🚀 Antigravity Proxy Server'));
  console.log(chalk.gray('━'.repeat(60)));
  console.log(`${chalk.bold('📍 Proxy listening on:')} ${chalk.green(`http://localhost:${port}`)}`);
  console.log(`${chalk.bold('🔑 Using API Key:')} ${chalk.yellow(apiKey.substring(0, 15) + '***')}`);
  console.log(`${chalk.bold('🎯 Target:')} ${chalk.blue(config.targetApiUrl)}`);
  console.log(`${chalk.bold('📊 Log Level:')} ${chalk.magenta(config.logLevel)}`);
  console.log(chalk.gray('━'.repeat(60)));
  console.log(chalk.green('\n✨ Waiting for requests from Antigravity...\n'));
};

export default logger;

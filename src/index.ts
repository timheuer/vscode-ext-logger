/**
 * VS Code Extension Logger
 * A library to make logging simpler for VS Code extension authors.
 */

// Export all types
export type { LoggerOptions, LogContentsResult, LogOutputChannel } from './types';
export { LogLevel } from './types';

// Export utility classes
export { LogLevelUtils } from './log-level-utils';

// Export main Logger class
export { Logger } from './logger';

// Export factory functions
export {
  createLogger,
  createLoggerWithLevel,
  createLoggerWithLevelAsync,
  createLoggerFromConfig,
  createLoggerFromConfigAsync,
  createLoggerWithConfigMonitoring,
  createLoggerWithConfigMonitoringAsync,
} from './factory';

// Export log contents utilities
export { getLogContentsForChannel, getLogContents } from './log-contents';

// Export a default logger instance
import { Logger } from './logger';
export const logger = new Logger();

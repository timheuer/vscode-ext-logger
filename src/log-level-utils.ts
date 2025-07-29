/**
 * Utility functions for LogLevel enum
 */

import { LogLevel } from './types';

/**
 * Utility functions for LogLevel enum
 */
export class LogLevelUtils {
  /**
   * Convert a string log level to LogLevel enum
   * @param level - String representation of log level (case-insensitive)
   * @returns LogLevel enum value
   */
  static fromString(level: string): LogLevel {
    switch (level.toLowerCase().trim()) {
      case 'off':
        return LogLevel.Off;
      case 'error':
        return LogLevel.Error;
      case 'warn':
      case 'warning':
        return LogLevel.Warn;
      case 'info':
        return LogLevel.Info;
      case 'debug':
        return LogLevel.Debug;
      case 'trace':
        return LogLevel.Trace;
      default:
        return LogLevel.Info; // Default fallback
    }
  }

  /**
   * Convert LogLevel enum to string representation
   * @param level - LogLevel enum value
   * @returns String representation of the log level
   */
  static toString(level: LogLevel): string {
    switch (level) {
      case LogLevel.Off:
        return 'off';
      case LogLevel.Error:
        return 'error';
      case LogLevel.Warn:
        return 'warn';
      case LogLevel.Info:
        return 'info';
      case LogLevel.Debug:
        return 'debug';
      case LogLevel.Trace:
        return 'trace';
      default:
        return 'info';
    }
  }

  /**
   * Get all valid string log level options
   * @returns Array of valid log level strings
   */
  static getValidLevels(): string[] {
    return ['off', 'error', 'warn', 'warning', 'info', 'debug', 'trace'];
  }
}

/**
 * VS Code Extension Logger
 * A library to make logging simpler for VS Code extension authors.
 */

export interface LoggerOptions {
  name?: string;
  level?: LogLevel | string;
  outputChannel?: boolean;
}

// Interface to define the LogOutputChannel shape to avoid 'any'
interface LogOutputChannel {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
  trace(message: string): void;
  show(): void;
  dispose(): void;
}

export enum LogLevel {
  Off = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Trace = 5,
}

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

export class Logger {
  private name: string;
  private level: LogLevel;
  private outputChannel?: LogOutputChannel;

  constructor(options: LoggerOptions = {}) {
    this.name = options.name || 'Extension';

    // Handle both string and LogLevel types for level option
    if (typeof options.level === 'string') {
      this.level = LogLevelUtils.fromString(options.level);
    } else {
      this.level = options.level ?? LogLevel.Info;
    }

    // Default outputChannel to true if not explicitly set to false
    const useOutputChannel = options.outputChannel ?? true;

    if (useOutputChannel && this.isVSCodeEnvironment()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const vscode = require('vscode');
        this.outputChannel = vscode.window.createOutputChannel(this.name, { log: true });
      } catch {
        // VSCode not available, continue without output channel
      }
    }
  }

  private isVSCodeEnvironment(): boolean {
    try {
      require('vscode');
      return true;
    } catch {
      return false;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.level !== LogLevel.Off && level <= this.level;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    // Format arguments for logging
    const formattedArgs =
      args.length > 0
        ? args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')
        : '';

    const fullMessage = formattedArgs ? `${message} ${formattedArgs}` : message;

    // Log to VS Code LogOutputChannel if available
    if (this.outputChannel) {
      switch (level) {
        case LogLevel.Error:
          this.outputChannel.error(fullMessage);
          break;
        case LogLevel.Warn:
          this.outputChannel.warn(fullMessage);
          break;
        case LogLevel.Info:
          this.outputChannel.info(fullMessage);
          break;
        case LogLevel.Debug:
          this.outputChannel.debug(fullMessage);
          break;
        case LogLevel.Trace:
          this.outputChannel.trace(fullMessage);
          break;
      }
    } else {
      // Fallback to console when VS Code is not available
      // eslint-disable-next-line no-console
      console.log(`[${this.name}] ${fullMessage}`);
    }
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Error, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Warn, message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Info, message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Debug, message, ...args);
  }

  trace(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Trace, message, ...args);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Set the log level from a string value
   * @param level - String representation of log level (case-insensitive)
   */
  setLevelFromString(level: string): void {
    this.level = LogLevelUtils.fromString(level);
  }

  /**
   * Update log level from VS Code configuration
   * @param configSection - The configuration section (e.g., 'myExtension')
   * @param configKey - The configuration key for log level (default: 'logLevel')
   * @param defaultLevel - Default level if config is not found (default: 'info')
   */
  setLevelFromConfig(
    configSection: string,
    configKey: string = 'logLevel',
    defaultLevel: string = 'info'
  ): void {
    if (this.isVSCodeEnvironment()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const vscode = require('vscode');
        const config = vscode.workspace.getConfiguration(configSection);
        const logLevelSetting = config.get(configKey, defaultLevel) as string;
        this.setLevelFromString(logLevelSetting);
      } catch {
        // If VS Code is not available or config fails, use default
        this.setLevelFromString(defaultLevel);
      }
    } else {
      // If not in VS Code environment, use default
      this.setLevelFromString(defaultLevel);
    }
  }

  getLevel(): LogLevel {
    return this.level;
  }

  show(): void {
    if (this.outputChannel) {
      this.outputChannel.show();
    }
  }

  dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose();
    }
  }
}

// Export a default logger instance
export const logger = new Logger();

// Convenience function to create a new logger
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}

/**
 * Create a logger with string-based log level
 * @param name - Logger name
 * @param level - Log level as string
 * @param outputChannel - Whether to use VS Code output channel (default: true)
 * @returns New Logger instance
 */
export function createLoggerWithLevel(
  name: string,
  level: string,
  outputChannel: boolean = true
): Logger {
  return new Logger({ name, level, outputChannel });
}

/**
 * Create a logger that automatically configures itself from VS Code settings
 * @param name - Logger name
 * @param configSection - The configuration section to read from
 * @param configKey - The configuration key for log level (default: 'logLevel')
 * @param defaultLevel - Default level if config is not found (default: 'info')
 * @param outputChannel - Whether to use VS Code output channel (default: true)
 * @returns New Logger instance
 */
export function createLoggerFromConfig(
  name: string,
  configSection: string,
  configKey: string = 'logLevel',
  defaultLevel: string = 'info',
  outputChannel: boolean = true
): Logger {
  const logger = new Logger({ name, level: defaultLevel, outputChannel });
  logger.setLevelFromConfig(configSection, configKey, defaultLevel);
  return logger;
}

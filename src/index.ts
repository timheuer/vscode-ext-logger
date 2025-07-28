/**
 * VS Code Extension Logger
 * A library to make logging simpler for VS Code extension authors.
 */

import type { ExtensionContext } from 'vscode';

export interface LoggerOptions {
  name?: string;
  level?: LogLevel | string;
  outputChannel?: boolean;
  context?: ExtensionContext | undefined; // VS Code ExtensionContext
  monitorConfig?: boolean; // Enable automatic config monitoring when using createLoggerFromConfig
}

export interface LogContentsResult {
  success: boolean;
  contents?: string;
  error?: string;
  filePath?: string;
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
  private context?: ExtensionContext | undefined;
  private configWatcher?: { dispose(): void }; // VS Code configuration watcher
  private configSection?: string;
  private configKey?: string;
  private defaultLevel?: string;

  constructor(options: LoggerOptions = {}) {
    this.name = options.name || 'Extension';
    this.context = options.context;

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

  /**
   * Enable automatic monitoring of VS Code configuration changes for log level
   * @param configSection - The configuration section (e.g., 'myExtension')
   * @param configKey - The configuration key for log level (default: 'logLevel')
   * @param defaultLevel - Default level if config is not found (default: 'info')
   */
  enableConfigMonitoring(
    configSection: string,
    configKey: string = 'logLevel',
    defaultLevel: string = 'info'
  ): void {
    // Store config details for monitoring
    this.configSection = configSection;
    this.configKey = configKey;
    this.defaultLevel = defaultLevel;

    // Set initial level from config
    this.setLevelFromConfig(configSection, configKey, defaultLevel);

    // Set up config watcher if in VS Code environment
    if (this.isVSCodeEnvironment()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const vscode = require('vscode');

        // Create configuration change listener
        this.configWatcher = vscode.workspace.onDidChangeConfiguration((event: unknown) => {
          // Type guard for event parameter
          if (event && typeof event === 'object' && 'affectsConfiguration' in event) {
            const configEvent = event as { affectsConfiguration(section: string): boolean };

            // Check if our specific config section was changed
            if (configEvent.affectsConfiguration(configSection)) {
              const config = vscode.workspace.getConfiguration(configSection);
              const logLevelSetting = config.get(configKey, defaultLevel) as string;
              this.setLevelFromString(logLevelSetting);
            }
          }
        });

        // Add to context subscriptions for automatic cleanup if context is available
        if (this.context?.subscriptions && this.configWatcher) {
          this.context.subscriptions.push(this.configWatcher);
        }
      } catch {
        // If VS Code is not available, silently continue without monitoring
      }
    }
  }

  /**
   * Disable automatic configuration monitoring
   */
  disableConfigMonitoring(): void {
    if (this.configWatcher) {
      this.configWatcher.dispose();
      delete this.configWatcher;
    }
    delete this.configSection;
    delete this.configKey;
    delete this.defaultLevel;
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
    // Disable config monitoring if enabled
    this.disableConfigMonitoring();

    if (this.outputChannel) {
      this.outputChannel.dispose();
    }
  }

  /**
   * Get the contents of the persisted log file for this logger
   * @returns Promise<LogContentsResult> - Object containing success status, contents, and metadata
   */
  async getLogContents(): Promise<LogContentsResult> {
    if (!this.context) {
      return {
        success: false,
        error: 'Extension context with logUri is required. Pass context to Logger constructor.',
      };
    }
    return Logger.getLogContentsForChannel(this.name, this.context);
  }

  /**
   * Static method to get log contents for any channel name
   * @param channelName - The name of the output channel
   * @param context - VS Code ExtensionContext with logUri (required)
   * @returns Promise<LogContentsResult> - Object containing success status, contents, and metadata
   */
  static async getLogContentsForChannel(
    channelName: string,
    context?: ExtensionContext
  ): Promise<LogContentsResult> {
    if (!Logger.isVSCodeEnvironmentStatic()) {
      return {
        success: false,
        error: 'VS Code environment not available',
      };
    }

    if (!context || !context.logUri) {
      return {
        success: false,
        error: 'Extension context with logUri is required but not available',
      };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const vscode = require('vscode');

      // Use context.logUri directly - this is the canonical approach
      const logFilePath = vscode.Uri.joinPath(context.logUri, `${channelName}.log`);

      try {
        // First, check if the file exists
        const fileStat = await vscode.workspace.fs.stat(logFilePath);
        if (fileStat.type !== vscode.FileType.File) {
          return {
            success: false,
            error: 'Log file path exists but is not a file',
            filePath: logFilePath.fsPath,
          };
        }

        // Read the file contents
        const fileBytes = await vscode.workspace.fs.readFile(logFilePath);
        const contents = Buffer.from(fileBytes).toString('utf8');

        return {
          success: true,
          contents,
          filePath: logFilePath.fsPath,
        };
      } catch (fileError: unknown) {
        const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown file error';
        return {
          success: false,
          error: `Failed to read log file: ${errorMessage}`,
          filePath: logFilePath.fsPath,
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `VS Code API error: ${errorMessage}`,
      };
    }
  }

  /**
   * Static helper to check if VS Code environment is available
   * @returns boolean - True if VS Code environment is detected
   */
  private static isVSCodeEnvironmentStatic(): boolean {
    try {
      require('vscode');
      return true;
    } catch {
      return false;
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
 * @param context - Optional VS Code ExtensionContext (required for log contents access)
 * @returns New Logger instance
 */
export function createLoggerWithLevel(
  name: string,
  level: string,
  outputChannel: boolean = true,
  context?: ExtensionContext | undefined
): Logger {
  return new Logger({ name, level, outputChannel, context });
}

/**
 * Create a logger that automatically configures itself from VS Code settings
 * @param name - Logger name
 * @param configSection - The configuration section to read from
 * @param configKey - The configuration key for log level (default: 'logLevel')
 * @param defaultLevel - Default level if config is not found (default: 'info')
 * @param outputChannel - Whether to use VS Code output channel (default: true)
 * @param context - Optional VS Code ExtensionContext (required for log contents access and automatic cleanup)
 * @param monitorConfig - Enable automatic monitoring of config changes (default: false to avoid conflicts with existing extension monitoring)
 * @returns New Logger instance
 */
export function createLoggerFromConfig(
  name: string,
  configSection: string,
  configKey: string = 'logLevel',
  defaultLevel: string = 'info',
  outputChannel: boolean = true,
  context?: ExtensionContext | undefined,
  monitorConfig: boolean = false
): Logger {
  const logger = new Logger({ name, level: defaultLevel, outputChannel, context });

  if (monitorConfig) {
    // Enable automatic config monitoring
    logger.enableConfigMonitoring(configSection, configKey, defaultLevel);
  } else {
    // Just set the initial level from config without monitoring
    logger.setLevelFromConfig(configSection, configKey, defaultLevel);
  }

  return logger;
}

/**
 * Create a logger that monitors VS Code configuration changes automatically
 * This is a convenience function that always enables config monitoring
 * @param name - Logger name
 * @param configSection - The configuration section to read from
 * @param configKey - The configuration key for log level (default: 'logLevel')
 * @param defaultLevel - Default level if config is not found (default: 'info')
 * @param outputChannel - Whether to use VS Code output channel (default: true)
 * @param context - Optional VS Code ExtensionContext (required for log contents access and automatic cleanup)
 * @returns New Logger instance with automatic config monitoring enabled
 */
export function createLoggerWithConfigMonitoring(
  name: string,
  configSection: string,
  configKey: string = 'logLevel',
  defaultLevel: string = 'info',
  outputChannel: boolean = true,
  context?: ExtensionContext | undefined
): Logger {
  return createLoggerFromConfig(
    name,
    configSection,
    configKey,
    defaultLevel,
    outputChannel,
    context,
    true
  );
}

/**
 * Get log contents for a specific channel name
 * @param channelName - The name of the output channel
 * @param context - VS Code ExtensionContext with logUri (required)
 * @returns Promise<LogContentsResult> - Object containing success status, contents, and metadata
 */
export async function getLogContentsForChannel(
  channelName: string,
  context: ExtensionContext
): Promise<LogContentsResult> {
  return Logger.getLogContentsForChannel(channelName, context);
}

/**
 * Get log contents for the default logger channel
 * @param context - VS Code ExtensionContext with logUri (required)
 * @returns Promise<LogContentsResult> - Object containing success status, contents, and metadata
 */
export async function getLogContents(context: ExtensionContext): Promise<LogContentsResult> {
  // Safely access nested properties for graceful degradation
  const channelName = context?.extension?.packageJSON?.displayName || 'Extension';
  return Logger.getLogContentsForChannel(channelName, context);
}

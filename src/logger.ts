/**
 * Core Logger class for VS Code Extension Logger
 */

import type { ExtensionContext } from 'vscode';
import { LogLevel, LoggerOptions, LogOutputChannel, LogContentsResult } from './types';
import { LogLevelUtils } from './log-level-utils';

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
      this.initializeOutputChannelSync();
    }
  }

  private initializeOutputChannelSync(): void {
    try {
      // Use dynamic import to synchronously require vscode
      const vscode = eval('require')('vscode');
      this.outputChannel = vscode.window.createOutputChannel(this.name, { log: true });
    } catch {
      // VS Code not available, outputChannel will remain undefined
      // Logger will fall back to console logging
    }
  }

  /**
   * Ensure the output channel is initialized. Call this in async activate() if needed.
   * @returns Promise that resolves when output channel is ready
   */
  async ensureOutputChannel(): Promise<void> {
    if (this.outputChannel) {
      return; // Already initialized
    }

    if (this.isVSCodeEnvironment()) {
      try {
        // Use dynamic import to avoid bundling vscode
        const vscode = await eval('import')('vscode');
        this.outputChannel = vscode.window.createOutputChannel(this.name, { log: true });
      } catch {
        // VS Code not available, outputChannel will remain undefined
        // Logger will fall back to console logging
      }
    }
  }

  private isVSCodeEnvironment(): boolean {
    try {
      // Use dynamic import to avoid bundling vscode
      eval('require')('vscode');
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
        // Use dynamic import to avoid bundling vscode
        const vscode = eval('require')('vscode');
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
        // Use dynamic import to avoid bundling vscode
        const vscode = eval('require')('vscode');

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
      // Use dynamic import to avoid bundling vscode
      const vscode = eval('require')('vscode');

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
      // Use dynamic import to avoid bundling vscode
      eval('require')('vscode');
      return true;
    } catch {
      return false;
    }
  }
}

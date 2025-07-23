/**
 * VS Code Extension Logger
 * A library to make logging simpler for VS Code extension authors.
 */

export interface LoggerOptions {
  name?: string;
  level?: LogLevel;
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

export class Logger {
  private name: string;
  private level: LogLevel;
  private outputChannel?: LogOutputChannel;

  constructor(options: LoggerOptions = {}) {
    this.name = options.name || 'Extension';
    this.level = options.level ?? LogLevel.Info;

    if (options.outputChannel && this.isVSCodeEnvironment()) {
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

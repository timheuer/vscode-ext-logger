/**
 * VS Code Extension Logger
 * A library to make logging simpler for VS Code extension authors.
 */

export interface LoggerOptions {
  name?: string;
  level?: LogLevel;
  outputChannel?: boolean;
}

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private name: string;
  private level: LogLevel;
  private outputChannel?: any; // vscode.OutputChannel

  constructor(options: LoggerOptions = {}) {
    this.name = options.name || 'Extension';
    this.level = options.level ?? LogLevel.INFO;

    if (options.outputChannel && this.isVSCodeEnvironment()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const vscode = require('vscode');
        this.outputChannel = vscode.window.createOutputChannel(this.name);
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
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs =
      args.length > 0
        ? ` ${args
            .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
            .join(' ')}`
        : '';

    return `[${timestamp}] [${this.name}] ${level}: ${message}${formattedArgs}`;
  }

  private log(level: LogLevel, levelName: string, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, ...args);

    // Log to console
    console.log(formattedMessage);

    // Log to VS Code output channel if available
    if (this.outputChannel) {
      this.outputChannel.appendLine(formattedMessage);
    }
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, 'WARN', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
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

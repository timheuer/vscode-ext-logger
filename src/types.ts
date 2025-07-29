/**
 * Core type definitions for VS Code Extension Logger
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
export interface LogOutputChannel {
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

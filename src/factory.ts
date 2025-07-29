/**
 * Factory functions for creating Logger instances
 */

import type { ExtensionContext } from 'vscode';
import { Logger } from './logger';
import { LoggerOptions } from './types';

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

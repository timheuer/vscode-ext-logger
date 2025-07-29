/**
 * Log contents utility functions
 */

import type { ExtensionContext } from 'vscode';
import { LogContentsResult } from './types';
import { Logger } from './logger';

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

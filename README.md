# VS Code Extension Logger

A TypeScript library to make logging simpler for VS Code extension authors. Uses VS Code's native LogOutputChannel API for optimal integration.

## Features

- 🎯 **Simple API** - Easy to use logging interface
- 📊 **Complete Log Level Support** - Off, Error, Warn, Info, Debug, Trace
- 🔗 **Native VS Code Integration** - Uses LogOutputChannel for proper VS Code integration
- 📦 **TypeScript First** - Built with TypeScript for better developer experience
- 🎨 **Flexible** - Works both inside and outside VS Code environment
- 📍 **Structured Logging** - Leverages VS Code's built-in log formatting and filtering

## Installation

```bash
npm install @timheuer/vscode-ext-logger
```

## Quick Start

### Basic Usage

```typescript
import { Logger, LogLevel } from '@timheuer/vscode-ext-logger';

// Create a logger with VS Code LogOutputChannel integration
const logger = new Logger({
  name: context.extension.packageJSON.displayName, // If you have the ExtensionContext else put a string
  level: LogLevel.Info, // Or use string: level: 'info'
  outputChannel: true  // Enable VS Code LogOutputChannel integration
});

// Use the logger - messages appear in VS Code's Output panel
logger.info('Extension activated');
logger.warn('This is a warning');
logger.error('Something went wrong');
logger.debug('Debug information'); // Won't show with Info level
logger.trace('Detailed trace info'); // Won't show with Info level

// Change log level
logger.setLevel(LogLevel.Debug);
logger.debug('Now this will show');

// Disable all logging
logger.setLevel(LogLevel.Off);
```

### String-Based Log Levels (Simplified Configuration)

For easier configuration management (especially with VS Code settings), you can use string-based log levels:

```typescript
import { Logger, createLoggerWithLevel, createLoggerFromConfig } from '@timheuer/vscode-ext-logger';

// Create logger with string log level
const logger = new Logger({
  name: 'MyExtension',
  level: 'debug',  // String instead of LogLevel.Debug
  outputChannel: true
});

// Or use convenience function
const logger2 = createLoggerWithLevel('MyExtension', 'info');

// Automatically configure from VS Code settings
const logger3 = createLoggerFromConfig('MyExtension', 'myExtension');
// This reads from VS Code config: myExtension.logLevel

// Update log level from string
logger.setLevelFromString('trace');

// Update from VS Code configuration
logger.setLevelFromConfig('myExtension', 'logLevel', 'info');
```

### Simplified Extension Configuration

Instead of the manual mapping you showed, you can now do this:

```typescript
// Before (cumbersome):
const config = vscode.workspace.getConfiguration('loggerTester');
const logLevelSetting = config.get<string>('logLevel', 'info');
let logLevel: LogLevel;
switch (logLevelSetting.toLowerCase()) {
  case 'off': logLevel = LogLevel.Error; break; // etc...
}
const logger = new Logger({ name: 'Test', level: logLevel });

// After (simple):
const logger = createLoggerFromConfig('MyExtension', 'loggerTester');
// Or:
const logger = new Logger({ 
  name: 'MyExtension', 
  level: vscode.workspace.getConfiguration('loggerTester').get('logLevel', 'info')
});
```

## API Reference

### Logger Class

#### Constructor Options

```typescript
interface LoggerOptions {
  name?: string;               // Logger name (default: 'Extension')
  level?: LogLevel | string;   // Log level enum or string (default: LogLevel.Info)
  outputChannel?: boolean;     // Create VS Code LogOutputChannel (default: true)
  context?: ExtensionContext;  // VS Code ExtensionContext for accurate log file access
}
```

#### String Log Levels

All methods that accept `LogLevel` enum also accept string equivalents:

- `'off'` → `LogLevel.Off`
- `'error'` → `LogLevel.Error`
- `'warn'` or `'warning'` → `LogLevel.Warn`
- `'info'` → `LogLevel.Info`
- `'debug'` → `LogLevel.Debug`
- `'trace'` → `LogLevel.Trace`

String matching is **case-insensitive** and handles whitespace.

#### Log Levels

```typescript
enum LogLevel {
  Off = 0,    // No logging
  Error = 1,  // Only errors
  Warn = 2,   // Errors and warnings
  Info = 3,   // Errors, warnings, and info (default)
  Debug = 4,  // All except trace
  Trace = 5,  // All log levels
}
```

#### Methods

- `error(message: string, ...args: unknown[]): void` - Log error message
- `warn(message: string, ...args: unknown[]): void` - Log warning message
- `info(message: string, ...args: unknown[]): void` - Log info message
- `debug(message: string, ...args: unknown[]): void` - Log debug message
- `trace(message: string, ...args: unknown[]): void` - Log trace message
- `setLevel(level: LogLevel): void` - Set the log level
- `setLevelFromString(level: string): void` - Set log level from string
- `setLevelFromConfig(configSection: string, configKey?: string, defaultLevel?: string): void` - Update log level from VS Code configuration
- `getLevel(): LogLevel` - Get current log level
- `getLogContents(): Promise<LogContentsResult>` - Get the persisted log file contents for this logger
- `show(): void` - Show the VS Code output channel (if available)
- `dispose(): void` - Dispose of resources

#### Static Methods

- `Logger.getLogContentsForChannel(channelName: string): Promise<LogContentsResult>` - Get log contents for any channel name

### LogLevelUtils Class

Utility functions for working with log levels:

```typescript
import { LogLevelUtils } from '@timheuer/vscode-ext-logger';

// Convert string to LogLevel enum
const level = LogLevelUtils.fromString('debug'); // Returns LogLevel.Debug

// Convert LogLevel enum to string
const levelString = LogLevelUtils.toString(LogLevel.Error); // Returns 'error'

// Get all valid level strings
const validLevels = LogLevelUtils.getValidLevels(); 
// Returns: ['off', 'error', 'warn', 'warning', 'info', 'debug', 'trace']
```

### Convenience Functions

```typescript
import { 
  createLogger, 
  createLoggerWithLevel, 
  createLoggerFromConfig, 
  getLogContentsForChannel,
  getLogContents,
  logger 
} from '@timheuer/vscode-ext-logger';

// Use the default logger (no VS Code integration)
logger.info('Using default logger');

// Create a custom logger with VS Code integration
const myLogger = createLogger({
  name: 'MyComponent',
  level: LogLevel.Debug,
  outputChannel: true  // This creates the LogOutputChannel
});

// Create a logger with string-based level
const stringLogger = createLoggerWithLevel('MyComponent', 'debug');

// Create a logger that automatically reads from VS Code configuration
const configLogger = createLoggerFromConfig(
  'MyExtension',          // Logger name
  'myExtension',          // Config section
  'logLevel',             // Config key (optional, defaults to 'logLevel')
  'info'                  // Default level (optional, defaults to 'info')
);

// Create a simple logger without VS Code integration  
const simpleLogger = createLogger({
  name: 'SimpleComponent'
  // outputChannel defaults to false, so uses console.log fallback
});

// Get log contents for a specific channel
const logResult = await getLogContentsForChannel('MyExtension', context); // context required
if (logResult.success) {
  console.log('Log contents:', logResult.contents);
}

// Get log contents for the default 'Extension' channel
const defaultLogResult = await getLogContents(context); // context required
```

## VS Code LogOutputChannel Integration

When `outputChannel: true` is set and the library is running in a VS Code environment, logs are sent to VS Code's native LogOutputChannel. This provides:

- **Structured logging** with proper log levels
- **Built-in filtering** by log level in VS Code's Output panel
- **Timestamps** and formatting handled by VS Code
- **Performance optimized** logging

```typescript
const logger = new Logger({
  name: 'MyExtension',
  outputChannel: true
});

// Show the output channel in VS Code
logger.show();

// Logs appear with proper formatting and colors in VS Code's Output panel
logger.error('This appears in red');
logger.warn('This appears in yellow'); 
logger.info('This appears in blue');
logger.debug('This appears in gray');
logger.trace('This appears in light gray');
```

## Log Contents Retrieval

This library provides functionality to retrieve the persisted log file contents from VS Code's output channels. This is useful for debugging, exporting logs, or implementing custom log viewers within your extension.

### Basic Log Contents Access

```typescript
import { Logger, getLogContents, getLogContentsForChannel } from '@timheuer/vscode-ext-logger';

// In your extension's activate function
export function activate(context: vscode.ExtensionContext) {
  const logger = new Logger({ name: 'MyExtension', outputChannel: true, context });

  // Log some messages
  logger.info('Application started');
  logger.warn('Configuration issue detected');
  logger.error('Failed to load data');

  // Get log contents for this logger instance (uses stored context)
  const result = await logger.getLogContents();
  if (result.success) {
    console.log('Log file path:', result.filePath);
    console.log('Log contents:', result.contents);
  } else {
    console.error('Failed to read logs:', result.error);
  }
}
```

### Static Method for Any Channel

```typescript
// Get log contents for any channel by name (context required)
const result = await Logger.getLogContentsForChannel('SomeOtherExtension', context);
if (result.success) {
  const lines = result.contents.split('\n');
  const errorLines = lines.filter(line => line.includes('[ERROR]'));
  console.log(`Found ${errorLines.length} errors in the log`);
}
```

### Convenience Functions

```typescript
// Get log contents for a specific channel name (context required)
const specificResult = await getLogContentsForChannel('MyExtension', context);

// Get log contents for the default 'Extension' channel (context required)
const defaultResult = await getLogContents(context);
```

### LogContentsResult Interface

All log contents methods return a `LogContentsResult` object:

```typescript
interface LogContentsResult {
  success: boolean;      // Whether the operation succeeded
  contents?: string;     // The log file contents (if successful)
  error?: string;        // Error message (if failed)
  filePath?: string;     // Path to the log file (if available)
}
```

### Usage Examples

#### Error Handling and Analysis

```typescript
async function analyzeLogErrors() {
  const result = await logger.getLogContents();
  
  if (result.success && result.contents) {
    const lines = result.contents.split('\n');
    const errors = lines.filter(line => line.includes('[ERROR]'));
    const warnings = lines.filter(line => line.includes('[WARN]'));
    
    console.log(`Log analysis for ${result.filePath}:`);
    console.log(`- Total lines: ${lines.length}`);
    console.log(`- Errors: ${errors.length}`);
    console.log(`- Warnings: ${warnings.length}`);
    
    return { errors, warnings, totalLines: lines.length };
  } else {
    console.warn('Could not analyze logs:', result.error);
    return null;
  }
}
```

#### Export Logs for Support

```typescript
async function exportLogsForSupport() {
  const result = await getLogContentsForChannel('MyExtension');
  
  if (result.success) {
    // Create a support bundle with relevant information
    const supportData = {
      timestamp: new Date().toISOString(),
      logFilePath: result.filePath,
      logContents: result.contents,
      extensionVersion: '1.0.0', // Your extension version
      vscodeVersion: vscode.version
    };
    
    // Save or send to support
    const supportBundle = JSON.stringify(supportData, null, 2);
    return supportBundle;
  }
  
  return null;
}
```

#### VS Code Command Integration

```typescript
// In your extension's activate function - RECOMMENDED APPROACH
export function activate(context: vscode.ExtensionContext) {
  // Pass the context to enable accurate log file access via context.logUri
  const logger = new Logger({ 
    name: 'MyExtension', 
    outputChannel: true,
    context: context  // This enables proper log file location detection
  });
  
  // Register a command to show log contents
  const showLogsCommand = vscode.commands.registerCommand('myExtension.showLogs', async () => {
    const result = await logger.getLogContents(); // Uses context.logUri automatically
    
    if (result.success) {
      // Show in a new editor window
      const doc = await vscode.workspace.openTextDocument({
        content: result.contents,
        language: 'log'
      });
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage(`Unable to load logs: ${result.error}`);
    }
  });
  
  context.subscriptions.push(showLogsCommand);
  
  // Alternative: Use standalone functions with context
  const exportLogsCommand = vscode.commands.registerCommand('myExtension.exportLogs', async () => {
    const result = await getLogContents(context); // Pass context explicitly
    if (result.success) {
      // Save logs to a file or export for support
      console.log('Log file location:', result.filePath);
    }
  });
  
  context.subscriptions.push(exportLogsCommand);
}
```

### Log File Locations

The library uses VS Code's `context.logUri` to access log files. **Extension context is required** for log contents functionality.

#### Extension Context Required

Pass the `context` parameter (VS Code's ExtensionContext) to enable log file access:

```typescript
// ✅ REQUIRED: Pass context for log file access
const logger = new Logger({ 
  name: 'MyExtension', 
  outputChannel: true,
  context: context  // VS Code ExtensionContext
});

// Or with factory functions
const logger = createLoggerFromConfig('MyExtension', 'myExt', 'logLevel', 'info', true, context);

// Or with standalone functions
const result = await getLogContents(context);
```

#### No Fallback Path Detection

The library does **not** attempt to guess log file locations. If `context.logUri` is not available, log contents methods will return an error. This keeps the implementation simple and reliable.

```typescript
// ❌ Will fail without context
const logger = new Logger({ name: 'MyExt' });
const result = await logger.getLogContents(); 
// Returns: { success: false, error: 'Extension context with logUri is required...' }

// ✅ Works with context
const logger = new Logger({ name: 'MyExt', context });
const result = await logger.getLogContents(); // Uses context.logUri
```

### Requirements

- **VS Code Environment Required**: Log contents retrieval only works within VS Code extensions
- **Extension Context Required**: Must pass `context` parameter with `logUri` property
- **Output Channel Required**: The logger must use an output channel (`outputChannel: true`)
- **File Permissions**: Requires read access to VS Code's log directory (handled by `context.logUri`)

## Environment Compatibility

This library works both inside and outside VS Code environments:

- **Inside VS Code**: Uses LogOutputChannel for structured logging with proper formatting and filtering
- **Outside VS Code**: Falls back to console.log for basic logging (graceful degradation)

When `outputChannel: true` is set:

- **In VS Code**: Creates and uses a LogOutputChannel
- **Outside VS Code**: Falls back to console.log with `[LoggerName]` prefix

## Advanced Usage

### Disable Logging Completely

```typescript
logger.setLevel(LogLevel.Off);
// No logs will be output regardless of method called
```

### Structured Logging with Objects

```typescript
logger.info('User action completed', { 
  userId: '123', 
  action: 'file_save',
  duration: 150 
});
// Output: User action completed {"userId":"123","action":"file_save","duration":150}
```

### Multiple Loggers for Different Components

```typescript
const apiLogger = createLogger({ name: 'API', level: LogLevel.Debug });
const uiLogger = createLogger({ name: 'UI', level: LogLevel.Info });

apiLogger.debug('API request started');  // Shows in VS Code with [API] prefix
uiLogger.info('UI component mounted');   // Shows in VS Code with [UI] prefix
```

## Development

```bash
# Install dependencies
npm install

# Set version from Git versioning
npm run setversion

# Build the library (automatically updates version from Git)
npm run build

# Full build with linting and tests
npm run build:full

# Run tests (located in /test directory)
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Watch for changes and run tests
npm run watch
```

## Versioning

This project uses [Nerdbank.GitVersioning](https://github.com/dotnet/Nerdbank.GitVersioning) for automatic semantic versioning based on Git commits and tags, integrated via the npm package and Gulp tasks.

### Version Management

- **Development builds**: Automatically get versions based on Git history (e.g., `0.1.0`)
- **Release builds**: Created from `main` branch get stable versions
- **Version synchronization**: Gulp task automatically updates `package.json` from Git version info

### Build Process

The build process uses Gulp tasks that integrate with the `nerdbank-gitversioning` npm package:

1. `gulp setversion` - Updates package.json version from Git
2. `gulp build` - Sets version and builds the library
3. `gulp build:full` - Runs linting, tests, then builds

### Release Process

```bash
# Prepare a release (creates release branch and updates version)
npm run release

# Or manually:
nbgv prepare-release
git push origin main --follow-tags
```

The version in `package.json` is automatically managed by Gulp tasks using the nbgv npm package.

## CI/CD Pipeline

This project includes comprehensive GitHub Actions workflows for automated building, testing, and publishing:

### Workflow Overview

- **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
  - ✅ **Build & Test**: Runs on all PRs and pushes to main/develop
  - 📦 **Publish to NPM**: Triggered on GitHub releases
  - 🚀 **Preview Releases**: Beta versions published from develop branch

### Required GitHub Secrets

To enable NPM publishing, add these secrets to your GitHub repository:

1. **`NPM_TOKEN`** - Your NPM authentication token

   ```bash
   # Generate an NPM token with 'publish' permissions
   npm login
   npm token create
   ```

## Project Structure

```text
├── src/
│   └── index.ts        # Main library code
├── test/               # Test directory
│   └── index.test.ts   # Test suite  
├── dist/               # Built files (CJS + ESM)
├── package.json        # Package configuration
├── version.json        # Nerdbank.GitVersioning config
├── gulpfile.js         # Gulp build tasks
├── tsconfig.json       # TypeScript config
├── jest.config.js      # Jest test config
├── .eslintrc.js        # ESLint config
├── .prettierrc         # Prettier config
└── README.md           # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

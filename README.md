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
- `show(): void` - Show the VS Code output channel (if available)
- `dispose(): void` - Dispose of resources

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

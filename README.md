# VS Code Extension Logger

A TypeScript library to make logging simpler for VS Code extension authors.

## Features

- 🎯 **Simple API** - Easy to use logging interface
- 📊 **Multiple Log Levels** - ERROR, WARN, INFO, DEBUG
- 🔗 **VS Code Integration** - Optional integration with VS Code Output Channel
- 📦 **TypeScript First** - Built with TypeScript for better developer experience
- 🎨 **Flexible** - Works both inside and outside VS Code environment

## Installation

```bash
npm install @timheuer/vscode-ext-logger
```

## Quick Start

```typescript
import { Logger, LogLevel } from '@timheuer/vscode-ext-logger';

// Create a logger
const logger = new Logger({
  name: 'MyExtension',
  level: LogLevel.INFO,
  outputChannel: true // Creates VS Code output channel if available
});

// Use the logger
logger.info('Extension activated');
logger.warn('This is a warning');
logger.error('Something went wrong');
logger.debug('Debug information'); // Won't show with INFO level

// Change log level
logger.setLevel(LogLevel.DEBUG);
logger.debug('Now this will show');
```

## API Reference

### Logger Class

#### Constructor Options

```typescript
interface LoggerOptions {
  name?: string;        // Logger name (default: 'Extension')
  level?: LogLevel;     // Log level (default: LogLevel.INFO)
  outputChannel?: boolean; // Create VS Code output channel (default: false)
}
```

#### Log Levels

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}
```

#### Methods

- `error(message: string, ...args: any[]): void` - Log error message
- `warn(message: string, ...args: any[]): void` - Log warning message
- `info(message: string, ...args: any[]): void` - Log info message
- `debug(message: string, ...args: any[]): void` - Log debug message
- `setLevel(level: LogLevel): void` - Set the log level
- `getLevel(): LogLevel` - Get current log level
- `show(): void` - Show the VS Code output channel (if available)
- `dispose(): void` - Dispose of resources

### Convenience Functions

```typescript
import { createLogger, logger } from '@timheuer/vscode-ext-logger';

// Use the default logger
logger.info('Using default logger');

// Create a custom logger
const myLogger = createLogger({
  name: 'MyComponent',
  level: LogLevel.DEBUG
});
```

## VS Code Integration

When `outputChannel: true` is set and the library is running in a VS Code environment, logs will also be sent to a VS Code Output Channel. This makes it easy to view logs directly in VS Code.

```typescript
const logger = new Logger({
  name: 'MyExtension',
  outputChannel: true
});

// Show the output channel
logger.show();
```

## Environment Compatibility

This library works both inside and outside VS Code environments:

- **Inside VS Code**: Full functionality including output channel integration
- **Outside VS Code**: Console logging only (graceful degradation)

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

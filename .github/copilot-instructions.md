# VS Code Extension Logger - Copilot Instructions

## Project Overview

This is a TypeScript npm package that provides logging utilities specifically for VS Code extension authors. It bridges between VS Code's native `LogOutputChannel` API and fallback console logging for non-VS Code environments.

## Core Architecture

### Dual Environment Pattern

The library implements **graceful degradation** between VS Code and Node.js environments:

```typescript
// Core pattern in src/index.ts
private isVSCodeEnvironment(): boolean {
  try {
    require('vscode');
    return true;
  } catch {
    return false;
  }
}
```

- **In VS Code**: Uses `vscode.window.createOutputChannel(name, { log: true })` for structured logging
- **Outside VS Code**: Falls back to `console.log` with `[LoggerName]` prefix
- VS Code dependency is marked as `peerDependencies.optional` in `package.json`

### String-to-Enum Conversion Strategy

Key innovation: **LogLevelUtils** class eliminates manual switch statements for extension authors:

```typescript
// Extension authors can now do this instead of manual mapping:
new Logger({ level: 'debug' })              // vs LogLevel.Debug
logger.setLevelFromString('trace')
createLoggerFromConfig('MyExt', 'myExt')    // Auto-reads VS Code settings
```

Supports: `'off'|'error'|'warn'|'warning'|'info'|'debug'|'trace'` (case-insensitive, whitespace-tolerant)

## Development Workflows

### Build System (Gulp + tsup)

- **Building Local**: When building locally and not in a CI environment, use `npm run build:local` only to avoid version scripts
- **Version Management**: Uses `nerdbank-gitversioning` - version comes from Git history, not manual editing
- **Critical Build Order**: `gulp build:full` = `prebuild` (lint + test) → `setversion` → `build`
- **Dual Output**: tsup generates both CJS (`dist/index.js`) and ESM (`dist/index.mjs`) with TypeScript definitions
- **⚠️ VERSION PLACEHOLDER CRITICAL**: After any build command, `package.json` version MUST be restored to `"0.0.0-placeholder"` in source. Build commands overwrite this, breaking release workflows.

```bash
# Primary commands (always use these for consistent versioning):
npm run build:full    # Full validation + build
npm run setversion    # Updates package.json from Git version
npm run release       # Full release pipeline (build → publish → tag → push)

# CRITICAL: After any build, restore the placeholder:
git checkout package.json  # Restore "0.0.0-placeholder" version
```

### Testing Strategy

- **Jest-based** with mocked `console.log` in `beforeEach`/`afterEach` pattern
- **Mock Pattern**: All tests disable output channel (`outputChannel: false`) to avoid VS Code dependency
- **Test Coverage**: Validates both enum and string-based APIs extensively (25 tests)

## Key Patterns & Conventions

### Constructor Flexibility Pattern

```typescript
// LoggerOptions accepts both enum and string for level:
interface LoggerOptions {
  level?: LogLevel | string;  // This union type drives the string conversion logic
}
```

### Factory Function Hierarchy

Three creation patterns with increasing convenience:

1. `new Logger(options)` - Full control
2. `createLoggerWithLevel(name, stringLevel)` - String convenience  
3. `createLoggerFromConfig(name, configSection)` - VS Code settings integration

### Message Formatting Convention

```typescript
// Arguments are JSON.stringified and space-joined:
logger.info('User action', { userId: 123 }, 'completed')
// → "[LoggerName] User action {"userId":123} completed"
```

## External Dependencies & Integration

### Nerdbank GitVersioning Integration

- `version.json` controls semantic versioning from Git
- `gulp setversion` task must run before builds
- **Version placeholder `"0.0.0-placeholder"` must NEVER be committed as changed** - always restore after builds
- **⚠️ CRITICAL**: Any commit with a real version number instead of the placeholder breaks the release pipeline

### VS Code Extension Integration Points

- **Peer Dependency**: `vscode` is optional, enabling library testing outside VS Code
- **Configuration Pattern**: `setLevelFromConfig()` reads from `vscode.workspace.getConfiguration()`
- **Output Channel**: Uses `{ log: true }` option for native VS Code log level filtering

## Critical Implementation Details

### Error Handling Philosophy

- **Silent Degradation**: VS Code API failures fall back to console logging
- **Invalid Inputs**: Unknown log level strings default to `LogLevel.Info`
- **No Exceptions**: Library never throws - always provides usable logger instance

### TypeScript External Declaration

`tsup.config.ts` marks `'vscode'` as external - it's not bundled, allowing library to work without VS Code installed.

When adding new features:

- Always support both enum and string APIs for consistency
- Add corresponding test cases in both `describe` blocks
- Update `LogLevelUtils.getValidLevels()` if adding new log level mappings
- Maintain the graceful degradation pattern for VS Code-specific features

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.35] - 2025-09-24

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.32] - 2025-09-10

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.3] - 2025-07-23

### Changed

- **BREAKING CHANGE**: Changed default value of `outputChannel` option to `true` instead of `false`
  - Logger instances now create VS Code output channels by default
  - Users can still disable by explicitly setting `outputChannel: false`
  - Improves out-of-the-box experience for VS Code extension developers

### Added

- Automatic release tagging with `nbgv` after successful npm publish
- Added `postpublish`, `tag-release`, and `publish-with-tag` npm scripts
- Added gulp tasks for `tag-release` and `publish-and-tag` workflows

## [0.1.0] - 2025-07-23

### Initial Release

- Initial release of VS Code Extension Logger
- `Logger` class with configurable logging levels (Off, Error, Warn, Info, Debug, Trace)
- Support for VS Code LogOutputChannel integration
- Fallback to console logging when VS Code is not available
- TypeScript support with full type definitions
- `LoggerOptions` interface for configuration
- `createLogger()` convenience function
- Default logger instance export
- Comprehensive test suite with Jest
- ESM and CommonJS support via dual package exports
- Automated build pipeline with Gulp and tsup
- Integration with Nerdbank.GitVersioning for version management

### Key Features

- **VS Code Integration**: Seamless integration with VS Code's output channels
- **Flexible Logging**: Support for multiple log levels with easy configuration
- **Environment Detection**: Automatically detects VS Code environment
- **TypeScript First**: Built with TypeScript for excellent developer experience
- **Dual Package Support**: Works with both ESM and CommonJS projects
- **Zero Dependencies**: No runtime dependencies (VS Code is a peer dependency)

---

## Release Notes

### Breaking Changes in Unreleased Version

The default behavior for `outputChannel` has changed from `false` to `true`. This means:

**Before:**

```typescript
const logger = new Logger(); // No output channel created
const logger = new Logger({ outputChannel: true }); // Output channel created
```

**After:**

```typescript
const logger = new Logger(); // Output channel created by default
const logger = new Logger({ outputChannel: false }); // No output channel created
```

If you were relying on the previous default behavior, you'll need to explicitly set `outputChannel: false` when creating your logger instances.

### Migration Guide

If you want to maintain the old behavior (no output channel by default), update your logger creation:

```typescript
// Old code (no changes needed if outputChannel was explicit)
const logger = new Logger({ outputChannel: true });

// Update this if you relied on the old default
const logger = new Logger(); // Now creates output channel
// Change to:
const logger = new Logger({ outputChannel: false });
```

import {
  Logger,
  LogLevel,
  LogLevelUtils,
  createLogger,
  createLoggerWithLevel,
  createLoggerFromConfig,
} from '../src/index';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    // Mock console.log to avoid output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    logger = new Logger({ name: 'Test' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a logger with default options', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger.getLevel()).toBe(LogLevel.Info);
    });

    it('should create a logger with custom options', () => {
      const customLogger = new Logger({
        name: 'CustomLogger',
        level: LogLevel.Debug,
      });
      expect(customLogger.getLevel()).toBe(LogLevel.Debug);
    });
  });

  describe('logging methods', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] Test error message')
      );
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[Test] Test warn message'));
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[Test] Test info message'));
    });

    it('should log debug messages when level is DEBUG', () => {
      logger.setLevel(LogLevel.Debug);
      logger.debug('Test debug message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] Test debug message')
      );
    });

    it('should log trace messages when level is TRACE', () => {
      logger.setLevel(LogLevel.Trace);
      logger.trace('Test trace message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] Test trace message')
      );
    });

    it('should not log debug messages when level is INFO', () => {
      logger.setLevel(LogLevel.Info);
      logger.debug('Test debug message');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not log any messages when level is OFF', () => {
      logger.setLevel(LogLevel.Off);
      logger.error('Error message');
      logger.warn('Warn message');
      logger.info('Info message');
      logger.debug('Debug message');
      logger.trace('Trace message');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('level management', () => {
    it('should set and get log level', () => {
      logger.setLevel(LogLevel.Error);
      expect(logger.getLevel()).toBe(LogLevel.Error);
    });

    it('should respect log level filtering', () => {
      logger.setLevel(LogLevel.Error);

      logger.error('Error message');
      logger.warn('Warn message');
      logger.info('Info message');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[Test] Error message'));
    });

    it('should handle arguments in log messages', () => {
      logger.info('Message with args', { key: 'value' }, 123);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] Message with args {"key":"value"} 123')
      );
    });
  });

  describe('createLogger function', () => {
    it('should create a new logger instance', () => {
      const newLogger = createLogger({ name: 'NewLogger', level: LogLevel.Warn });
      expect(newLogger.getLevel()).toBe(LogLevel.Warn);
    });
  });

  describe('VS Code LogOutputChannel integration', () => {
    it('should handle missing VS Code gracefully', () => {
      // Test that the logger works even when VS Code is not available
      const loggerWithChannel = new Logger({ name: 'TestChannel', outputChannel: true });
      loggerWithChannel.info('Test message');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[TestChannel] Test message')
      );
    });
  });
});

describe('LogLevelUtils', () => {
  describe('fromString', () => {
    it('should convert string log levels to LogLevel enum', () => {
      expect(LogLevelUtils.fromString('off')).toBe(LogLevel.Off);
      expect(LogLevelUtils.fromString('error')).toBe(LogLevel.Error);
      expect(LogLevelUtils.fromString('warn')).toBe(LogLevel.Warn);
      expect(LogLevelUtils.fromString('warning')).toBe(LogLevel.Warn);
      expect(LogLevelUtils.fromString('info')).toBe(LogLevel.Info);
      expect(LogLevelUtils.fromString('debug')).toBe(LogLevel.Debug);
      expect(LogLevelUtils.fromString('trace')).toBe(LogLevel.Trace);
    });

    it('should be case insensitive', () => {
      expect(LogLevelUtils.fromString('ERROR')).toBe(LogLevel.Error);
      expect(LogLevelUtils.fromString('WaRn')).toBe(LogLevel.Warn);
      expect(LogLevelUtils.fromString('INFO')).toBe(LogLevel.Info);
    });

    it('should handle whitespace', () => {
      expect(LogLevelUtils.fromString(' error ')).toBe(LogLevel.Error);
      expect(LogLevelUtils.fromString('\tdebug\n')).toBe(LogLevel.Debug);
    });

    it('should default to Info for invalid strings', () => {
      expect(LogLevelUtils.fromString('invalid')).toBe(LogLevel.Info);
      expect(LogLevelUtils.fromString('')).toBe(LogLevel.Info);
    });
  });

  describe('toString', () => {
    it('should convert LogLevel enum to string', () => {
      expect(LogLevelUtils.toString(LogLevel.Off)).toBe('off');
      expect(LogLevelUtils.toString(LogLevel.Error)).toBe('error');
      expect(LogLevelUtils.toString(LogLevel.Warn)).toBe('warn');
      expect(LogLevelUtils.toString(LogLevel.Info)).toBe('info');
      expect(LogLevelUtils.toString(LogLevel.Debug)).toBe('debug');
      expect(LogLevelUtils.toString(LogLevel.Trace)).toBe('trace');
    });
  });

  describe('getValidLevels', () => {
    it('should return all valid level strings', () => {
      const validLevels = LogLevelUtils.getValidLevels();
      expect(validLevels).toEqual(['off', 'error', 'warn', 'warning', 'info', 'debug', 'trace']);
    });
  });
});

describe('String-based Logger functionality', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger constructor with string level', () => {
    it('should accept string log level in constructor', () => {
      const logger = new Logger({ name: 'Test', level: 'debug' });
      expect(logger.getLevel()).toBe(LogLevel.Debug);
    });

    it('should accept LogLevel enum in constructor', () => {
      const logger = new Logger({ name: 'Test', level: LogLevel.Error });
      expect(logger.getLevel()).toBe(LogLevel.Error);
    });
  });

  describe('setLevelFromString', () => {
    it('should set log level from string', () => {
      const logger = new Logger({ name: 'Test' });
      logger.setLevelFromString('error');
      expect(logger.getLevel()).toBe(LogLevel.Error);
    });
  });

  describe('createLoggerWithLevel', () => {
    it('should create logger with string level', () => {
      const logger = createLoggerWithLevel('TestLogger', 'warn');
      expect(logger.getLevel()).toBe(LogLevel.Warn);
    });
  });

  describe('createLoggerFromConfig', () => {
    it('should create logger with default level when VS Code is not available', () => {
      const logger = createLoggerFromConfig('TestLogger', 'testConfig', 'logLevel', 'debug');
      expect(logger.getLevel()).toBe(LogLevel.Debug);
    });
  });
});

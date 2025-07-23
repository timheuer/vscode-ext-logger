import { Logger, LogLevel, createLogger } from '../src/index';

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

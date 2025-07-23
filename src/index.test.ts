import { Logger, LogLevel, createLogger } from './index';

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
      expect(defaultLogger.getLevel()).toBe(LogLevel.INFO);
    });

    it('should create a logger with custom options', () => {
      const customLogger = new Logger({
        name: 'CustomLogger',
        level: LogLevel.DEBUG,
      });
      expect(customLogger.getLevel()).toBe(LogLevel.DEBUG);
    });
  });

  describe('logging methods', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] ERROR: Test error message')
      );
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] WARN: Test warn message')
      );
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] INFO: Test info message')
      );
    });

    it('should log debug messages when level is DEBUG', () => {
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('Test debug message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test] DEBUG: Test debug message')
      );
    });

    it('should not log debug messages when level is INFO', () => {
      logger.setLevel(LogLevel.INFO);
      logger.debug('Test debug message');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('level management', () => {
    it('should set and get log level', () => {
      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it('should respect log level filtering', () => {
      logger.setLevel(LogLevel.ERROR);

      logger.error('Error message');
      logger.warn('Warn message');
      logger.info('Info message');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Error message'));
    });
  });

  describe('createLogger function', () => {
    it('should create a new logger instance', () => {
      const newLogger = createLogger({ name: 'NewLogger', level: LogLevel.WARN });
      expect(newLogger.getLevel()).toBe(LogLevel.WARN);
    });
  });
});

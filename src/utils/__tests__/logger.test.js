describe('logger.js', () => {
  let logger;
  let consoleInfoSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;
  let consoleDebugSpy;

  const setupLogger = (mode) => {
    jest.resetModules();
    process.env.MODE = mode;
    process.env.NODE_ENV = mode;
    // Vite's import.meta.env.MODE is shimmed by jest config; we re-evaluate the module
    logger = require('../logger').logger;
  };

  beforeEach(() => {
    setupLogger('development');
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logs info with [INFO] prefix in development', () => {
    logger.info('Test info');
    expect(consoleInfoSpy).toHaveBeenCalled();
    expect(consoleInfoSpy.mock.calls[0][0]).toContain('[INFO]');
    expect(consoleInfoSpy.mock.calls[0][0]).toContain('Test info');
  });

  test('logs warn with [WARN] prefix in development', () => {
    logger.warn('Test warn');
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN]');
  });

  test('logs debug with [DEBUG] prefix in development', () => {
    logger.debug('Test debug');
    expect(consoleDebugSpy).toHaveBeenCalled();
    expect(consoleDebugSpy.mock.calls[0][0]).toContain('[DEBUG]');
  });

  test('logs error with [ERROR] prefix in development', () => {
    logger.error('Test error');
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]');
  });

  test('passes optional params to console methods', () => {
    const extra = { key: 'value' };
    logger.info('msg', extra);
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), extra);
  });

  test('logs fallback message in production mode', () => {
    setupLogger('production');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Prod error');

    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred. Check external monitoring.');
  });

  test('does not log info in production mode', () => {
    setupLogger('production');
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger.info('silent');
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  test('does not log warn in production mode', () => {
    setupLogger('production');
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('silent');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test('does not log debug in production mode', () => {
    setupLogger('production');
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    logger.debug('silent');
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });
});

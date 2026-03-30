describe("logger.js", () => {
  let logger;
  let consoleInfoSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;
  let consoleDebugSpy;

  beforeEach(() => {
    jest.resetModules(); // ✅ clear cache

    // ✅ Set env BEFORE importing logger
    process.env.MODE = "development";
    process.env.NODE_ENV = "development";

    // ✅ Import AFTER env setup
    logger = require("../logger").logger;

    // ✅ Mock console methods
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ✅ INFO
  test("should log info in development mode", () => {
    logger.info("Test info");

    expect(consoleInfoSpy).toHaveBeenCalled();
    expect(consoleInfoSpy.mock.calls[0][0]).toContain("[INFO]");
  });

  // ✅ WARN
  test("should log warn in development mode", () => {
    logger.warn("Test warn");

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toContain("[WARN]");
  });

  // ✅ DEBUG
  test("should log debug in development mode", () => {
    logger.debug("Test debug");

    expect(consoleDebugSpy).toHaveBeenCalled();
    expect(consoleDebugSpy.mock.calls[0][0]).toContain("[DEBUG]");
  });

  // ✅ ERROR (development)
  test("should log error in development mode", () => {
    logger.error("Test error");

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain("[ERROR]");
  });

  // ✅ ERROR (production fallback)
  test("should log fallback message in production mode", () => {
    jest.resetModules(); // 🔥 re-evaluate module

    process.env.MODE = "production";
    process.env.NODE_ENV = "production";

    logger = require("../logger").logger;

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    logger.error("Prod error");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "An error occurred. Check external monitoring."
    );
  });
});
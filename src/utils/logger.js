/**
 * Simple logger utility to configure and standardize logging across the application.
 * In a production app, this can be directed to a service like DataDog or Sentry.
 */
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message, ...optionalParams) => {
    if (isDevelopment) {
      console.info(`[INFO] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    }
  },
  warn: (message, ...optionalParams) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    }
  },
  error: (message, ...optionalParams) => {
    // We typically want to log errors even in production, or send them to a monitoring service.
    if (isDevelopment) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    } else {
      // Simulate sending to an external logger in production
      // externalLogger.send(message, ...optionalParams);
      console.error('An error occurred. Check external monitoring.');
    }
  },
  debug: (message, ...optionalParams) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    }
  }
};

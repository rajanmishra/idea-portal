'use strict';

module.exports = {
  logger: {
    warn: () => jest.fn(),
    info: () => jest.fn(),
    debug: () => jest.fn(),
    error: () => jest.fn(),
    log: () => jest.fn(),
  },
  mongooseConnection: {
    close: jest.fn(),
  },
  redisClient: {
    connect: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  },
  sentry: {
    captureException: jest.fn(),
    withScope: jest.fn(),
  },
};

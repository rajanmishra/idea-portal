'use strict';

const { faker } = require('@faker-js/faker');

const pkg = require('../../../package.json');
const { ENVIRONMENTS, SERVICE_NOT_READY } = require('../../../src/constants');
const MICROSERVICES = require('../../../src/constants/microservices');
const { ServiceNotReady } = require('../../../src/errors/types');
const getConfig = require('../../../src/config');

describe('getConfig function', () => {
  describe('when env variables are defined properly', () => {
    let NAME;
    let VERSION;
    let SERVER_PORT;
    let SERVER_KEEP_ALIVE_TIMEOUT;
    let SERVER_RETURN_VALIDATION_INFO_ERROR;
    let MONGODB_URL;
    let MONGODB_MIN_POOL_SIZE;
    let MONGODB_MAX_POOL_SIZE;
    let MONGODB_SERVER_SELECTION_TIMEOUT;
    let REDIS_URL;
    let REDIS_CACHE_URL;
    let SENTRY_DSN;
    let SENTRY_RELEASE;
    let LOG_LEVEL;
    let LOG_IS_PRETTY_LOGGING_ENABLED;
    let SWAGGER_ENABLED;
    let NEW_RELIC_APP_NAME;
    let NEW_RELIC_LICENSE_KEY;
    let NEW_RELIC_ENABLED;
    let NEW_RELIC_VERSION;
    let MICROSERVICE_URLS_EXAMPLE;
    let MICROSERVICE_TIMEOUT;

    beforeEach(() => {
      NAME = `${faker.random.word()}-app`;
      VERSION = `${faker.datatype.number({ min: 1, max: 99 })}.${faker.datatype.number({ min: 0, max: 99 })}.${faker.datatype.number({ min: 0, max: 99 })}`;
      SERVER_PORT = faker.datatype.number({ min: 1, max: 9999 });
      SERVER_KEEP_ALIVE_TIMEOUT = faker.datatype.number({ min: 1, max: 100000 });
      SERVER_RETURN_VALIDATION_INFO_ERROR = faker.datatype.boolean() ? 'true' : 'false';
      MONGODB_URL = `mongodb://${faker.random.words()}:27017/${faker.random.words()}`;
      MONGODB_MIN_POOL_SIZE = faker.datatype.number({ min: 1, max: 9 });
      MONGODB_MAX_POOL_SIZE = faker.datatype.number({ min: 10, max: 100 });
      MONGODB_SERVER_SELECTION_TIMEOUT = faker.datatype.number({ min: 10000, max: 100000 });
      REDIS_URL = `redis://${faker.random.words()}:16379/${faker.datatype.number({ min: 1, max: 100 })}`;
      REDIS_CACHE_URL = `redis://${faker.random.words()}:16379/${faker.datatype.number({ min: 1, max: 100 })}`;
      SENTRY_DSN = `https://public@sentry.${faker.random.words()}.com/${faker.datatype.number({ min: 1, max: 100 })}`;
      SENTRY_RELEASE = `${NAME}@${VERSION}`;
      LOG_LEVEL = faker.random.arrayElement(['silent', 'error', 'warn', 'info', 'debug']);
      LOG_IS_PRETTY_LOGGING_ENABLED = faker.datatype.boolean() ? 'true' : 'false';
      SWAGGER_ENABLED = faker.datatype.boolean() ? 'true' : 'false';
      NEW_RELIC_APP_NAME = `${faker.random.word()}-new-relic-app`;
      NEW_RELIC_LICENSE_KEY = `${faker.random.word()}_example_license_key`;
      NEW_RELIC_ENABLED = faker.datatype.boolean() ? 'true' : 'false';
      NEW_RELIC_VERSION = `${faker.datatype.number({ min: 1, max: 99 })}
      .${faker.datatype.number({ min: 0, max: 99 })}
      .${faker.datatype.number({ min: 0, max: 99 })}`;
      MICROSERVICE_URLS_EXAMPLE = `http://${faker.random.word()}:${faker.datatype.number({ min: 1, max: 9999 })}/`;
      MICROSERVICE_TIMEOUT = faker.datatype.number({ min: 1, max: 10000 });

      process.env = {
        NAME,
        VERSION,
        SERVER_PORT,
        SERVER_KEEP_ALIVE_TIMEOUT,
        SERVER_RETURN_VALIDATION_INFO_ERROR,
        SENTRY_DSN,
        SENTRY_RELEASE,
        NEW_RELIC_APP_NAME,
        NEW_RELIC_LICENSE_KEY,
        NEW_RELIC_ENABLED,
        NEW_RELIC_VERSION,
        MONGODB_URL,
        MONGODB_MIN_POOL_SIZE,
        MONGODB_MAX_POOL_SIZE,
        MONGODB_SERVER_SELECTION_TIMEOUT,
        REDIS_URL,
        REDIS_CACHE_URL,
        LOG_LEVEL,
        LOG_IS_PRETTY_LOGGING_ENABLED,
        SWAGGER_ENABLED,
        MICROSERVICE_URLS_EXAMPLE,
        MICROSERVICE_TIMEOUT,
      };
    });

    afterEach(() => {
      process.env = {};
    });

    it('it should be equal to expected env based config values for dev environment', () => {
      const config = getConfig({ env: ENVIRONMENTS.DEV });

      expect(typeof config).toBe('object');
      expect(config.env).toBe(ENVIRONMENTS.DEV);
      expect(config.name).toBe(NAME);
      expect(config.version).toBe(VERSION);
      expect(config.server.port).toBe(SERVER_PORT);
      expect(config.server.keepAliveTimeout).toBe(SERVER_KEEP_ALIVE_TIMEOUT);
      expect(config.server.returnValidationInfoError).toBe(SERVER_RETURN_VALIDATION_INFO_ERROR.trim().toLowerCase() === 'true');
      expect(config.sentry.dsn).toBe(SENTRY_DSN);
      expect(config.sentry.release).toBe(SENTRY_RELEASE);
      expect(config.mongodb.url).toBe(MONGODB_URL);
      expect(config.mongodb.minPoolSize).toBe(MONGODB_MIN_POOL_SIZE);
      expect(config.mongodb.maxPoolSize).toBe(MONGODB_MAX_POOL_SIZE);
      expect(config.mongodb.serverSelectionTimeoutMS).toBe(MONGODB_SERVER_SELECTION_TIMEOUT);
      expect(config.redis.url).toBe(REDIS_URL);
      expect(config.redisCache.url).toBe(REDIS_CACHE_URL);
      expect(config.swagger.enabled).toBe(SWAGGER_ENABLED.trim().toLowerCase() === 'true');
      expect(config.log.level).toBe(LOG_LEVEL);
      expect(config.log.isPrettyLoggingEnabled).toBe(LOG_IS_PRETTY_LOGGING_ENABLED.trim().toLowerCase() === 'true');
      expect(config.microservice.urls[MICROSERVICES.example]).toBe(MICROSERVICE_URLS_EXAMPLE);
      expect(config.microservice.timeout).toBe(MICROSERVICE_TIMEOUT);
    });

    it('it should be equal to expected env based config values for test environment', () => {
      const config = getConfig({ env: ENVIRONMENTS.TEST });

      expect(typeof config).toBe('object');
      expect(config.env).toBe(ENVIRONMENTS.TEST);
      expect(config.name).toBe(NAME);
      expect(config.version).toBe(VERSION);
      expect(config.server.port).toBe(SERVER_PORT);
      expect(config.server.keepAliveTimeout).toBe(SERVER_KEEP_ALIVE_TIMEOUT);
      expect(config.server.returnValidationInfoError).toBe(SERVER_RETURN_VALIDATION_INFO_ERROR.trim().toLowerCase() === 'true');
      expect(config.sentry.dsn).toBe(SENTRY_DSN);
      expect(config.sentry.release).toBe(SENTRY_RELEASE);
      expect(config.mongodb.url).toBe(MONGODB_URL);
      expect(config.mongodb.minPoolSize).toBe(MONGODB_MIN_POOL_SIZE);
      expect(config.mongodb.maxPoolSize).toBe(MONGODB_MAX_POOL_SIZE);
      expect(config.mongodb.serverSelectionTimeoutMS).toBe(MONGODB_SERVER_SELECTION_TIMEOUT);
      expect(config.redis.url).toBe(REDIS_URL);
      expect(config.redisCache.url).toBe(REDIS_CACHE_URL);
      expect(config.swagger.enabled).toBe(SWAGGER_ENABLED.trim().toLowerCase() === 'true');
      expect(config.log.level).toBe(LOG_LEVEL);
      expect(config.log.isPrettyLoggingEnabled).toBe(LOG_IS_PRETTY_LOGGING_ENABLED.trim().toLowerCase() === 'true');
      expect(config.microservice.urls[MICROSERVICES.example]).toBe(MICROSERVICE_URLS_EXAMPLE);
      expect(config.microservice.timeout).toBe(MICROSERVICE_TIMEOUT);
    });

    it('it should be equal to expected env based config values for prod environment', () => {
      const config = getConfig({ env: ENVIRONMENTS.PROD });

      expect(typeof config).toBe('object');
      expect(config.env).toBe(ENVIRONMENTS.PROD);
      expect(config.name).toBe(NAME);
      expect(config.version).toBe(VERSION);
      expect(config.server.port).toBe(SERVER_PORT);
      expect(config.server.keepAliveTimeout).toBe(SERVER_KEEP_ALIVE_TIMEOUT);
      expect(config.server.returnValidationInfoError).toBe(SERVER_RETURN_VALIDATION_INFO_ERROR.trim().toLowerCase() === 'true');
      expect(config.sentry.dsn).toBe(SENTRY_DSN);
      expect(config.sentry.release).toBe(SENTRY_RELEASE);
      expect(config.mongodb.url).toBe(MONGODB_URL);
      expect(config.mongodb.minPoolSize).toBe(MONGODB_MIN_POOL_SIZE);
      expect(config.mongodb.maxPoolSize).toBe(MONGODB_MAX_POOL_SIZE);
      expect(config.mongodb.serverSelectionTimeoutMS).toBe(MONGODB_SERVER_SELECTION_TIMEOUT);
      expect(config.redis.url).toBe(REDIS_URL);
      expect(config.redisCache.url).toBe(REDIS_CACHE_URL);
      expect(config.swagger.enabled).toBe(SWAGGER_ENABLED.trim().toLowerCase() === 'true');
      expect(config.log.level).toBe(LOG_LEVEL);
      expect(config.log.isPrettyLoggingEnabled).toBe(LOG_IS_PRETTY_LOGGING_ENABLED.trim().toLowerCase() === 'true');
      expect(config.microservice.urls[MICROSERVICES.example]).toBe(MICROSERVICE_URLS_EXAMPLE);
      expect(config.microservice.timeout).toBe(MICROSERVICE_TIMEOUT);
    });
  });

  describe('when only required env variables are given ', () => {
    let MONGODB_URL;
    let REDIS_URL;
    let REDIS_CACHE_URL;
    let MICROSERVICE_URLS_EXAMPLE;

    beforeEach(() => {
      MONGODB_URL = `mongodb://${faker.random.words()}:27017/${faker.random.words()}`;
      REDIS_URL = `redis://${faker.random.words()}:16379/${faker.datatype.number({ min: 1, max: 100 })}`;
      REDIS_CACHE_URL = `redis://${faker.random.words()}:16379/${faker.datatype.number({ min: 1, max: 100 })}`;
      MICROSERVICE_URLS_EXAMPLE = `http://${faker.random.word()}:${faker.datatype.number({ min: 1, max: 9999 })}/`;

      process.env = {
        MONGODB_URL,
        REDIS_URL,
        REDIS_CACHE_URL,
        MICROSERVICE_URLS_EXAMPLE,
      };
    });

    afterEach(() => {
      process.env = {};
    });

    it('it should be equal to expected default config values for dev environment', () => {
      const config = getConfig({ env: ENVIRONMENTS.DEV });

      expect(typeof config).toBe('object');
      expect(config.env).toBe(ENVIRONMENTS.DEV);
      expect(config.name).toBe(pkg.name);
      expect(config.version).toBe(pkg.version);
      expect(config.server.port).toBe(8080);
      expect(config.server.keepAliveTimeout).toBe(120000);
      expect(config.server.returnValidationInfoError).toBe(true);
      expect(config.sentry.release).toBe(`${pkg.name}@${pkg.version}`);
      expect(config.mongodb.url).toBe(MONGODB_URL);
      expect(config.mongodb.minPoolSize).toBe(1);
      expect(config.mongodb.maxPoolSize).toBe(4);
      expect(config.redis.url).toBe(REDIS_URL);
      expect(config.redisCache.url).toBe(REDIS_CACHE_URL);
      expect(config.swagger.enabled).toBe(true);
      expect(config.log.level).toBe('debug');
      expect(config.log.isPrettyLoggingEnabled).toBe(true);
      expect(config.microservice.urls[MICROSERVICES.example]).toBe(MICROSERVICE_URLS_EXAMPLE);
      expect(config.microservice.timeout).toBe(10000);
    });

    it('it should be equal to expected default config values for test environment', () => {
      const config = getConfig({ env: ENVIRONMENTS.TEST });

      expect(typeof config).toBe('object');
      expect(config.env).toBe(ENVIRONMENTS.TEST);
      expect(config.name).toBe(pkg.name);
      expect(config.version).toBe(pkg.version);
      expect(config.server.keepAliveTimeout).toBe(120000);
      expect(config.server.returnValidationInfoError).toBe(false);
      expect(config.sentry.release).toBe(`${pkg.name}@${pkg.version}`);
      expect(config.mongodb.url).toBe(MONGODB_URL);
      expect(config.mongodb.minPoolSize).toBe(4);
      expect(config.mongodb.maxPoolSize).toBe(10);
      expect(config.redis.url).toBe(REDIS_URL);
      expect(config.redisCache.url).toBe(REDIS_CACHE_URL);
      expect(config.swagger.enabled).toBe(false);
      expect(config.log.level).toBe('info');
      expect(config.log.isPrettyLoggingEnabled).toBe(false);
      expect(config.microservice.urls[MICROSERVICES.example]).toBe(MICROSERVICE_URLS_EXAMPLE);
      expect(config.microservice.timeout).toBe(10000);
    });

    it('it should be equal to expected default config values for prod environment', () => {
      const config = getConfig({ env: ENVIRONMENTS.PROD });

      expect(typeof config).toBe('object');
      expect(config.env).toBe(ENVIRONMENTS.PROD);
      expect(config.name).toBe(pkg.name);
      expect(config.version).toBe(pkg.version);
      expect(config.server.port).toBe(8080);
      expect(config.server.keepAliveTimeout).toBe(120000);
      expect(config.server.returnValidationInfoError).toBe(false);
      expect(config.sentry.release).toBe(`${pkg.name}@${pkg.version}`);
      expect(config.mongodb.url).toBe(MONGODB_URL);
      expect(config.mongodb.minPoolSize).toBe(4);
      expect(config.mongodb.maxPoolSize).toBe(10);
      expect(config.redis.url).toBe(REDIS_URL);
      expect(config.redisCache.url).toBe(REDIS_CACHE_URL);
      expect(config.swagger.enabled).toBe(false);
      expect(config.log.level).toBe('info');
      expect(config.log.isPrettyLoggingEnabled).toBe(false);
      expect(config.microservice.urls[MICROSERVICES.example]).toBe(MICROSERVICE_URLS_EXAMPLE);
      expect(config.microservice.timeout).toBe(10000);
    });
  });

  describe('when env variables are defined with wrong type of value', () => {
    afterEach(() => {
      process.env = {};
    });

    it('it should throw a validation error when the NAME env variable is not a string', () => {
      process.env = {
        NAME: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw a validation error when the VERSION env variable is not a string', () => {
      process.env = {
        VERSION: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw a validation error when the SERVER_PORT env variable is not a number', () => {
      process.env = {
        SERVER_PORT: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw a validation error when the PORT env variable is not a number and the SERVER_PORT is not exist', () => {
      process.env = {
        SERVER_PORT: undefined,
        PORT: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw a validation error when the SERVER_KEEP_ALIVE_TIMEOUT env variable is not a number', () => {
      process.env = {
        SERVER_KEEP_ALIVE_TIMEOUT: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the MONGODB_URL env variable is not a string', () => {
      process.env = {
        MONGODB_URL: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the MONGODB_MIN_POOL_SIZE env variable is not a number', () => {
      process.env = {
        MONGODB_MIN_POOL_SIZE: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the MONGODB_MAX_POOL_SIZE env variable is not a number', () => {
      process.env = {
        MONGODB_MAX_POOL_SIZE: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the MONGODB_SERVER_SELECTION_TIMEOUT env variable is not a number', () => {
      process.env = {
        MONGODB_SERVER_SELECTION_TIMEOUT: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the REDIS_URL env variable is not a string', () => {
      process.env = {
        REDIS_URL: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the REDIS_CACHE_URL env variable is not a string', () => {
      process.env = {
        REDIS_CACHE_URL: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the SENTRY_DSN env variable is not a string', () => {
      process.env = {
        SENTRY_DSN: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the SENTRY_RELEASE env variable is not a string', () => {
      process.env = {
        SENTRY_RELEASE: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the LOG_LEVEL env variable is not a allowed string', () => {
      process.env = {
        LOG_LEVEL: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the NEW_RELIC_APP_NAME env variable is not a string', () => {
      process.env = {
        NEW_RELIC_APP_NAME: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the NEW_RELIC_LICENSE_KEY env variable is not a string', () => {
      process.env = {
        NEW_RELIC_LICENSE_KEY: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the NEW_RELIC_VERSION env variable is not a string', () => {
      process.env = {
        NEW_RELIC_VERSION: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the MICROSERVICE_URLS_EXAMPLE env variable is not a string', () => {
      process.env = {
        MICROSERVICE_URLS_EXAMPLE: faker.datatype.number(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });

    it('it should throw validation error when the MICROSERVICE_TIMEOUT env variable is not a number', () => {
      process.env = {
        MICROSERVICE_TIMEOUT: faker.random.word(),
      };

      let thrownError;
      try {
        getConfig({ env: faker.random.arrayElement(Object.values(ENVIRONMENTS)) });
      }
      catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceNotReady);
      expect(thrownError.name).toBe(SERVICE_NOT_READY.error);
      expect(thrownError.code).toBe(SERVICE_NOT_READY.code);
      expect(thrownError.data).toEqual({ message: expect.any(String), details: expect.any(Array) });
    });
  });
});

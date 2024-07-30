'use strict';

const { ENVIRONMENTS } = require('../../constants');
const MICROSERVICES = require('../../constants/microservices');

module.exports = () => ({
  env: ENVIRONMENTS.DEV,
  mongodb: {
    url: process.env.MONGODB_URL ?? 'mongodb://localhost:27017',
    minPoolSize: +(process.env.MONGODB_MIN_POOL_SIZE ?? 1),
    maxPoolSize: +(process.env.MONGODB_MAX_POOL_SIZE ?? 4),
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379/0',
  },
  redisCache: {
    url: process.env.REDIS_CACHE_URL ?? 'redis://localhost:6379/1',
  },
  server: {
    beforeShutdownDelay: Number(process.env.SERVER_BEFORE_SHUTDOWN_DELAY ?? 0),
    returnValidationInfoError: (process.env.SERVER_RETURN_VALIDATION_INFO_ERROR ?? 'true').trim().toLowerCase() === 'true',
  },
  swagger: {
    enabled: (process.env.SWAGGER_ENABLED ?? 'true').trim().toLowerCase() === 'true',
  },
  log: {
    level: process.env.LOG_LEVEL ?? 'debug',
    isPrettyLoggingEnabled: (process.env.LOG_IS_PRETTY_LOGGING_ENABLED ?? 'true').trim().toLowerCase() === 'true',
  },
  microservice: {
    urls: {
      [MICROSERVICES.example]: process.env.MICROSERVICE_URLS_EXAMPLE ?? 'http://localhost:9000/',
    },
  },
});

'use strict';

const pkg = require('../../package.json');
const { ENVIRONMENTS } = require('../constants');
const MICROSERVICES = require('../constants/microservices');

module.exports = () => {
  const name = process.env.NAME ?? pkg.name;
  const version = process.env.VERSION ?? pkg.version;
  const env = process.env.NODE_ENV ?? ENVIRONMENTS.DEV;

  return {
    name,
    version,
    env,
    newRelic: {
      appName: process.env.NEW_RELIC_APP_NAME ?? name,
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
      enabled: (process.env.NEW_RELIC_ENABLED ?? 'false').trim().toLowerCase() === 'true',
      labels: {
        version: process.env.NEW_RELIC_VERSION ?? version,
      },
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
      release: process.env.SENTRY_RELEASE ?? `${name}@${version}`,
      environment: process.env.SENTRY_ENVIRONMENT ?? env,
    },
    mongodb: {
      url: process.env.MONGODB_URL,
      minPoolSize: +(process.env.MONGODB_MIN_POOL_SIZE ?? 4),
      maxPoolSize: +(process.env.MONGODB_MAX_POOL_SIZE ?? 10),
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT ?? 30000),
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    redisCache: {
      url: process.env.REDIS_CACHE_URL,
    },
    pluginToComponentDependencyMapping: {
      CachePlugin: ['RedisCache'],
    },
    server: {
      port: Number(process.env.SERVER_PORT ?? process.env.PORT ?? 8080),
      keepAliveTimeout: Number(process.env.SERVER_KEEP_ALIVE_TIMEOUT ?? 120000),
      returnValidationInfoError: (process.env.SERVER_RETURN_VALIDATION_INFO_ERROR ?? 'false').trim().toLowerCase() === 'true',
      beforeShutdownDelay: Number(process.env.SERVER_BEFORE_SHUTDOWN_DELAY ?? 10000),
    },
    swagger: {
      enabled: (process.env.SWAGGER_ENABLED ?? 'false').trim().toLowerCase() === 'true',
    },
    log: {
      name,
      version,
      env,
      level: process.env.LOG_LEVEL ?? 'info',
      isPrettyLoggingEnabled: (process.env.LOG_IS_PRETTY_LOGGING_ENABLED ?? 'false').trim().toLowerCase() === 'true',
      prettyLoggingDepth: process.env.LOG_PRETTY_LOGGING_DEPTH,
    },
    microservice: {
      urls: {
        [MICROSERVICES.example]: process.env.MICROSERVICE_URLS_EXAMPLE,
      },
      timeout: Number(process.env.MICROSERVICE_TIMEOUT ?? 10000),
    },
  };
};

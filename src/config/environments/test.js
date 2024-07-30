'use strict';

const { ENVIRONMENTS } = require('../../constants');
const MICROSERVICES = require('../../constants/microservices');

module.exports = () => ({
  env: ENVIRONMENTS.TEST,
  mongodb: {
    url: process.env.MONGODB_URL ?? 'mongodb://localhost:27017',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379/0',
  },
  redisCache: {
    url: process.env.REDIS_CACHE_URL ?? 'redis://localhost:6379/1',
  },
  server: {
    beforeShutdownDelay: Number(process.env.SERVER_BEFORE_SHUTDOWN_DELAY ?? 0),
  },
  microservice: {
    urls: {
      [MICROSERVICES.example]: process.env.MICROSERVICE_URLS_EXAMPLE ?? 'http://localhost:9000/',
    },
  },
});

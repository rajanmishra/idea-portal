'use strict';

const { enableGracefulShutdown } = require('@getir/graceful-shutdown');

const DatabaseComponent = require('./bootstrap/modules/mongoose');
const RedisComponent = require('./bootstrap/modules/redis');
const RedisCacheComponent = require('./bootstrap/modules/redis-cache');
const EventComponent = require('./bootstrap/modules/events');
const ServerComponentCreator = require('./server');
const container = require('./bootstrap/container');
const { bootstrapWithContainer } = require('./bootstrap/utils');

async function main() {
  const config = container.resolve('config');
  const isSwaggerEnabled = config.swagger.enabled;
  const disabledPlugins = [
    ...(!isSwaggerEnabled ? ['SwaggerPlugin'] : []),
  ];
  const ServerComponent = ServerComponentCreator({ disabledPlugins });

  const componentsToBootstrap = {
    Redis: RedisComponent,
    RedisCache: RedisCacheComponent,
    Mongoose: DatabaseComponent,
    Event: EventComponent,
    // last to initialize is server
    Server: ServerComponent,
  };

  const { scopedContainer, stop } = await bootstrapWithContainer(
    container.createScope(),
    componentsToBootstrap,
  );

  const Server = scopedContainer.resolve('Server');
  const HealthService = scopedContainer.resolve('HealthService');
  const logger = container.resolve('logger');

  enableGracefulShutdown({
    server: Server.listener,
    cleanupHandler: stop,
    getHealthCheckHandler: () => HealthService.getLivenessCheck(),
    getReadinessCheckHandler: () => HealthService.getReadinessCheck(),
    beforeDelay: config.server.beforeShutdownDelay,
    logger,
  });
}

// eslint-disable-next-line no-console
main().catch(console.log);

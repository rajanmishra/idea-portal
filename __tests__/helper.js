'use strict';

const awilix = require('awilix');

const bootstrapContainer = require('../src/bootstrap/container');
const ServerComponentCreator = require('../src/server/index');
const ServiceCaller = require('./helpers/factories/service-caller');
const EventComponent = require('../src/bootstrap/modules/events');
const { bootstrapWithContainer } = require('../src/bootstrap/utils');
const { logger, sentry: mockSentry } = require('./mocks/modules');
const { TEST_SERVER_PORTS } = require('./constants');

const mockLogger = {
  ...logger,
  child: () => ({
    ...logger,
  }),
};

async function setupServer({ container = bootstrapContainer, extraComponents = {}, port = TEST_SERVER_PORTS.DEFAULT }) {
  const ServerComponent = ServerComponentCreator({ disabledPlugins: ['SwaggerPlugin', 'CachePlugin'] });
  const scoped = container.createScope();
  scoped.register('Sentry', awilix.asValue(mockSentry));
  scoped.register('logger', awilix.asValue(mockLogger));
  scoped.register('ServiceCaller', awilix.asValue(ServiceCaller));

  const config = scoped.resolve('config');
  config.server.port = port;
  scoped.register('config', awilix.asValue(config));

  const componentsToBootstrap = {
    ...extraComponents,
    Event: EventComponent,
    Server: ServerComponent,
  };
  const { stop } = await bootstrapWithContainer(scoped, componentsToBootstrap);
  return [scoped.resolve('Server'), stop, scoped];
}

module.exports = {
  setupServer,
};

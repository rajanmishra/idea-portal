'use strict';

const awilix = require('awilix');
const Hapi = require('@hapi/hapi');
const Sentry = require('@sentry/node');
const { formatCapitalizedWithAppend } = require('../bootstrap/utils');
const { getRequestIdFromRequest } = require('./utils');

class ServerComponent {
  constructor(logger, config, routes, plugins) {
    const { server: { port, returnValidationInfoError, keepAliveTimeout } } = config;
    const failAction = async (_, __, err) => {
      throw err;
    };
    const serverConfig = {
      port,
      ...(
        returnValidationInfoError
          ? { routes: { validate: { failAction } } }
          : {}
      ),
    };

    this.config = { host: config.host, port };
    this.logger = logger;
    this.routes = routes;
    this.plugins = plugins;
    this.server = Hapi.server(serverConfig);
    this.server.listener.keepAliveTimeout = keepAliveTimeout;
  }

  async start() {
    const {
      logger,
      config,
      server,
      routes,
      plugins,
    } = this;

    await Promise.all(plugins.map((plugin) => server.register(plugin)));
    await server.route(routes);
    await server.start();
    logger.info('started the server', config);
  }

  async stop() {
    const { server } = this;

    await server.stop();
  }

  register() {
    return this.server;
  }
}

const createRouteHandlerFunction = (container, logger, { controllerName, methodName }) => async (req, res) => {
  const requestId = getRequestIdFromRequest({ request: req });
  const scopedLogger = logger.child({ requestId });
  const scoped = container.createScope();

  Sentry.configureScope((scope) => scope.setExtra('requestId', requestId));

  container.register('requestId', awilix.asValue(requestId));
  scoped.register('requestId', awilix.asValue(requestId));
  scoped.register('logger', awilix.asValue(scopedLogger));

  const controller = scoped.resolve(controllerName);
  const routeHandler = controller[methodName].bind(controller);
  return routeHandler(req, res);
};

const createRouteModifier = (container) => (route) => {
  const logger = container.resolve('logger');
  const [controllerName, methodName] = route.handler.split('.');

  return {
    ...route,
    handler: createRouteHandlerFunction(container, logger, { controllerName, methodName }),
  };
};

const disableIncompatiblePlugins = (container) => {
  const logger = container.resolve('logger');
  const { pluginToComponentDependencyMapping } = container.resolve('config');
  const disabledPlugins = [];

  Object
    .entries(pluginToComponentDependencyMapping)
    .forEach(([plugin, components]) => {
      const missingComponents = components.filter((component) => !container.hasRegistration(component));

      if (missingComponents.length > 0) {
        disabledPlugins.push(plugin);

        logger.error(`${plugin} would be disabled because dependent component(s): '${components.join(', ')}' is/are missing!`);
      }
    });

  return disabledPlugins;
};

module.exports = ({ disabledPlugins = [] } = {}) => async (container) => {
  const pluginsPath = ['plugins/*.js'];
  const pluginNameFormatter = formatCapitalizedWithAppend('Plugin');
  container.loadModules(['controllers/*.js'], { cwd: __dirname, formatName: formatCapitalizedWithAppend('Controller') });
  container.loadModules(pluginsPath, { cwd: __dirname, formatName: pluginNameFormatter });

  const logger = container.resolve('logger');
  const config = container.resolve('config');
  const modifyRoute = createRouteModifier(container);

  const routes = (
    awilix
      .listModules(['routes/*.js'], { cwd: __dirname })
      .map(({ path }) => path)
      .map(require)
      .reduce((acc, rawRoutes) => acc.concat(rawRoutes.map(modifyRoute)), [])
  );

  const dynamicallyDisabledPlugins = disableIncompatiblePlugins(container);

  const plugins = (
    awilix
      .listModules(pluginsPath, { cwd: __dirname })
      .map(({ path }) => pluginNameFormatter(path))
      .filter((pluginName) => !([...disabledPlugins, ...dynamicallyDisabledPlugins]).includes(pluginName))
      .map(container.resolve)
  );

  return new ServerComponent(logger, config, routes, plugins);
};

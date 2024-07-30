'use strict';

const awilix = require('awilix');
const Sentry = require('@sentry/node');

const config = require('../config')();
const { logger } = require('../logger');
const { catcher } = require('../logger/catcher');
const ServiceCaller = require('../utils/service-caller');

const { formatCapitalizedWithAppend } = require('./utils');

// create container
const container = awilix.createContainer();

// register Sentry
container.register('Sentry', awilix.asValue(Sentry));

// register the global config object
container.register('config', awilix.asValue(config));

// register root logger
container.register('logger', awilix.asFunction(logger));

// register capture exception
container.register('catcher', awilix.asFunction(catcher));

// register service caller class
container.register('ServiceCaller', awilix.asClass(ServiceCaller));

// load models
container.loadModules(
  ['../models/*.js'],
  {
    cwd: __dirname,
    formatName: formatCapitalizedWithAppend('Model'),
  },
);

// load data access classes
container.loadModules(
  ['../data-access/*.js'],
  {
    cwd: __dirname,
    formatName: formatCapitalizedWithAppend('DataAccess'),
    resolverOptions: {
      lifetime: awilix.Lifetime.SINGLETON,
    },
  },
);

// load services
container.loadModules(
  ['../services/*.js'],
  {
    cwd: __dirname,
    formatName: formatCapitalizedWithAppend('Service'),
  },
);

// load service callers
container.loadModules(
  ['../service-callers/*.js'],
  {
    cwd: __dirname,
    formatName: formatCapitalizedWithAppend('ServiceCaller'),
  },
);

module.exports = container;

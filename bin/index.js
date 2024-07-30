require('newrelic');

const Sentry = require('@sentry/node');
const { sentry: sentryConfig } = require('../src/config')();

Sentry.init({
  dsn: sentryConfig.dsn,
  release: sentryConfig.release,
  environment: sentryConfig.environment,
});

require('../src');

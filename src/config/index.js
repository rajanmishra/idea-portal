'use strict';

const R = require('ramda');

const { ENVIRONMENTS } = require('../constants');
const environments = require('./environments');
const getDefaultConfig = require('./default');
const configValidationSchema = require('./schema');
const { ServiceNotReady } = require('../errors/types');

// env param is only used for test purpose
module.exports = ({ env: chosenEnv } = {}) => {
  const env = chosenEnv ?? process.env.NODE_ENV ?? ENVIRONMENTS.DEV;

  const getEnvSpecificConfig = environments[env];

  const config = R.mergeDeepRight(getDefaultConfig(), getEnvSpecificConfig());

  const { error } = configValidationSchema.validate(config, { abortEarly: false });
  if (error) {
    throw new ServiceNotReady({
      message: 'Config validation failed! Please check the error details and fix the misconfigured values.',
      details: error.details,
    });
  }

  return config;
};

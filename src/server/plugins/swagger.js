'use strict';

const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');

module.exports = ({ config: { swagger: swaggerConfig } }) => (swaggerConfig.enabled ? [
  Inert,
  Vision,
  {
    plugin: HapiSwagger,
    options: {
      sortEndpoints: 'ordered',
    },
  },
] : []);

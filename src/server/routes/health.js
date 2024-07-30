'use strict';

const {
  getLivenessCheck,
  getReadinessCheck,
} = require('../../schemas/controllers/health');

module.exports = ([
  {
    path: '/live',
    method: 'GET',
    options: {
      tags: ['api'],
      description: 'Health check for the liveness probe.',
      validate: getLivenessCheck.validate,
      response: getLivenessCheck.response,
      plugins: {
        logging: false,
        cache: { enabled: false },
      },
    },
    handler: 'HealthController.getLivenessCheck',
  },
  {
    path: '/ready',
    method: 'GET',
    options: {
      tags: ['api'],
      description: 'Health check for the readiness probe.',
      validate: getReadinessCheck.validate,
      response: getReadinessCheck.response,
      plugins: {
        logging: false,
        cache: { enabled: false },
      },
    },
    handler: 'HealthController.getReadinessCheck',
  },
]);

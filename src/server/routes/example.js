'use strict';

const {
  getIndex,
  getAllData,
} = require('../../schemas/controllers/example');

module.exports = ([
  {
    path: '/error-example',
    method: 'GET',
    options: {
      tags: ['api'],
      description: 'Throw error and emit failure event',
      validate: getIndex.validate,
      response: getIndex.response,
      plugins: {
        logging: true,
      },
    },
    handler: 'ExampleController.getIndex',
  },
  {
    path: '/example/all-data',
    method: 'GET',
    options: {
      tags: ['api'],
      description: 'Get all example data.',
      validate: getAllData.validate,
      response: getAllData.response,
      plugins: {
        logging: true,
      },
    },
    handler: 'ExampleController.getAllData',
  },
  {
    path: '/example/all-data-from-db',
    method: 'GET',
    options: {
      tags: ['api'],
      description: 'Get all example data from db.',
      validate: getAllData.validate,
      // response: getAllData.response,
      plugins: {
        logging: true,
        // To enable the cache for GET routes, we need to add the cache plugin options as below
        // cache: {
        //   enabled: true,
        //   ttl: 60 * 60 * 1000, // 1 hour long cache
        // },
      },
    },
    handler: 'ExampleController.getAllDataFromDB',
  },
]);

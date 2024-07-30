'use strict';

const exampleServiceMock = require('../../mocks/responses/detail-service');

// replace all ${xxxId} in the path with id
const RESPONSES = {
  example: {
    GET: {
      'detail/id': exampleServiceMock.detail,
    },
  },
};

module.exports = {
  request: ({ microservice, method, path }) => {
    const regularizedPath = path
      .split('/')
      .map((entity) => (/^[0-9a-fA-F]{24}$/.test(entity) ? 'id' : entity))
      .join('/');

    return RESPONSES[microservice][method][regularizedPath];
  },
};

'use strict';

const { createGenericErrorType } = require('./generic-error');

const GENERICS = [
  {
    error: 'BadRequestGenericError',
    statusCode: 400,
  },
  {
    error: 'AuthenticationGenericError',
    statusCode: 401,
  },
  {
    error: 'AuthorizationGenericError',
    statusCode: 403,
  },
  {
    error: 'NotFoundGenericError',
    statusCode: 404,
  },
  {
    error: 'ConflictGenericError',
    statusCode: 409,
  },
  {
    error: 'UncaughtGenericError',
    statusCode: 500,
  },
  {
    error: 'ServiceUnavailableGenericError',
    statusCode: 503,
  },
];

module.exports = (
  GENERICS
    .reduce((acc, message) => ({
      ...acc,
      [message.error]: createGenericErrorType({ error: message.error, statusCode: message.statusCode }),
    }), {})
);

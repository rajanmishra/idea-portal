'use strict';

const { BadRequestGenericError, ServiceUnavailableGenericError, UncaughtGenericError } = require('../errors/generics');
const ERROR_LEVELS = require('../errors/levels');

module.exports = {
  UNKNOWN: {
    error: 'UnknownError',
    message: 'unknown error',
    code: -1,
  },
  VALIDATION: {
    error: 'ValidationError',
    message: 'validation error',
    code: -2,
  },
  MICROSERVICE: {
    error: 'MicroserviceError',
    message: 'microservice error',
    code: -3,
  },
  TEST: {
    parent: UncaughtGenericError,
    error: 'TestError',
    level: ERROR_LEVELS.ERROR,
    message: 'test error',
    code: 1,
  },
  SERVICE_NOT_READY: {
    parent: ServiceUnavailableGenericError,
    error: 'ServiceNotReady',
    code: -4,
  },
  EXAMPLE: {
    parent: BadRequestGenericError,
    error: 'ExampleError',
    level: ERROR_LEVELS.WARN,
    message: 'example error message: {customData} from {service}.',
    code: 2,
  },
};

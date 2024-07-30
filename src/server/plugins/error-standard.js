'use strict';

const { parseError } = require('@sentry/node/dist/parsers');
const { parseRequest } = require('@sentry/node/dist/handlers');

const ERROR_MESSAGES = require('../../constants/error-messages');

const GetirError = require('../../errors/getir-error');

const { log: { isPrettyLoggingEnabled } } = require('../../config')();

const {
  getRequestIdFromRequest,
  stringFormat,
} = require('../utils');

const createGetirErrorResponse = ({ getirError }) => {
  const error = getirError.constructor.name;
  const { code, message, data } = getirError;

  return {
    code,
    error,
    message: stringFormat({ str: message, data }),
    data,
  };
};

const createMicroserviceErrorResponse = ({ microserviceError }) => {
  const { error } = ERROR_MESSAGES.MICROSERVICE;
  const {
    microservice, code, message, status: statusCode,
  } = microserviceError;

  return {
    microservice,
    code,
    error,
    message,
    statusCode,
  };
};

const createJoiErrorResponse = ({ joiError }) => {
  const { code, error } = ERROR_MESSAGES.VALIDATION;

  const { message, details, output: { payload: { statusCode, validation: { source } = {} } = {} } = {} } = joiError;

  return {
    code,
    error,
    message,
    details,
    statusCode,
    source,
  };
};

const createUnknownErrorResponse = ({ unknownError }) => {
  const { code, error, message } = ERROR_MESSAGES.UNKNOWN;
  const { message: detail, stack } = unknownError;

  return {
    code,
    error,
    message,
    detail,
    stack,
  };
};

const getOutputForError = ({ error }) => {
  if (error instanceof GetirError) {
    return createGetirErrorResponse({ getirError: error });
  }

  if (error && error.microservice) {
    return createMicroserviceErrorResponse({ microserviceError: error });
  }

  if (error && error.isJoi) {
    return createJoiErrorResponse({ joiError: error });
  }

  return createUnknownErrorResponse({ unknownError: error });
};

const parseSentryEvent = async ({ response, raw, payload }) => {
  if (!(response instanceof GetirError) && !response.isOriginatedFromAnotherService) {
    const sentryEvent = await parseError(response);
    const reqToBeParsed = { ...raw.req, body: payload };

    parseRequest(sentryEvent, reqToBeParsed);
    sentryEvent.extra = {
      ...sentryEvent.extra,
      microservice: response.microservice,
      serviceCallerRequest: response.serviceCallerRequest,
    };

    return sentryEvent;
  }

  return undefined;
};

module.exports = ({ logger, Sentry }) => ([
  {
    name: 'error-standard',
    version: '0.0.2',
    register(server) {
      server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
          parseSentryEvent(request)
            .then((event) => event && Sentry.captureEvent(event))
            .catch(Sentry.captureException);

          const payload = getOutputForError({ error: response });

          response.output.payload = payload;
          response.output.statusCode = response.statusCode ?? response.output?.payload?.statusCode ?? 500;

          const { method, path } = request;
          const requestId = getRequestIdFromRequest({ request });

          if (!isPrettyLoggingEnabled) {
            logger.log(response.level ?? 'error', {
              method,
              path,
              requestId,
              ...payload,
            });
          }
        }

        return h.continue;
      });
    },
  },
]);

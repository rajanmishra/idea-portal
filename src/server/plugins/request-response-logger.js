'use strict';

const { getRequestIdFromRequest } = require('../utils');

const { log: { isPrettyLoggingEnabled } } = require('../../config')();

const getStrippedPayload = ({ request }) => {
  // delete restricted keys from payload
  const restrictedKeys = ['password', 'oldPassword', 'newPassword', 'newPasswordAgain'];

  return (
    Object
      .keys(request.payload || {})
      .filter((key) => !restrictedKeys.includes(key))
      .reduce((acc, key) => ({ ...acc, [key]: request.payload[key] }), {})
  );
};

module.exports = ({ logger }) => ([
  {
    name: 'request-response-logger',
    version: '0.0.2',
    register: (server) => {
      server.ext('onRequest', (request, h) => {
        if (isPrettyLoggingEnabled) {
          const url = `${request.server.info.protocol}://${request.url.host}${request.url.pathname}`;

          logger.debug(`[HTTP Request] ${url} [${request.method.toUpperCase()}]`, {
            headers: request.headers,
            params: request.params,
            query: request.query,
            payload: getStrippedPayload({ request }),
          }, { $logOptions: { depth: 2 } });
        }

        return h.continue;
      });

      server.ext('onPreHandler', (request, h) => {
        const pluginSetting = request.route.settings.plugins;

        if (pluginSetting.logging) {
          request.headers['x-req-start'] = Date.now();

          if (!isPrettyLoggingEnabled) {
            logger.debug('request', {
              remoteAddress: request.headers['x-forwarded-for'],
              requestId: getRequestIdFromRequest({ request }),
              method: request.method.toUpperCase(),
              path: request.url.pathname,
              params: request.params,
              query: request.query,
              payload: getStrippedPayload({ request }),
            });
          }
        }

        return h.continue;
      });

      server.ext('onPreResponse', (request, h) => {
        const pluginSetting = request.route.settings.plugins;

        if (pluginSetting.logging) {
          // Handle both error and success cases if error output otherwise source will be used
          let output = request.response.source ? request.response.source : request.response.output.payload;
          const statusCode = request.response.source ? request.response.statusCode : request.response.output.statusCode || request.response.statusCode;

          // eslint-disable-next-line no-underscore-dangle
          if (statusCode === 200 && request.response._contentType !== 'application/json') {
            output = 'Only JSON data is valid for logging.';
          }

          if (isPrettyLoggingEnabled) {
            const url = `${request.server.info.protocol}://${request.url.host}${request.url.pathname}`;

            const responseMessage = `[HTTP Response] ${url} [${request.method.toUpperCase()}][${statusCode}]`;

            if (statusCode < 400) {
              logger.info(responseMessage, output, { $logOptions: { depth: 2 } });
            }

            else if (statusCode >= 400 && statusCode < 500) {
              logger.warn(responseMessage, output);
            }

            else {
              logger.error(responseMessage, output);
            }
          }
          else {
            logger.debug('response', {
              remoteAddress: request.headers['x-forwarded-for'],
              requestId: getRequestIdFromRequest({ request }),
              method: request.method.toUpperCase(),
              path: request.url.pathname,
              status: statusCode,
              response: output,
              elapsed: Date.now() - request.headers['x-req-start'],
            });
          }
        }

        return h.continue;
      });
    },
  },
]);

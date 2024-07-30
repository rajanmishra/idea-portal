'use strict';

const axios = require('axios');

const ServiceCallerError = require('../errors/service-caller');
const { MICROSERVICE } = require('../constants/error-messages');

const { deepObjectIdToString } = require('./string');

module.exports = class ServiceCaller {
  constructor({ config, logger, requestId }) {
    this.config = config;
    this.logger = logger;
    this.requestId = requestId;
  }

  static generateErrorFunction(microservice, request) {
    // eslint-disable-next-line default-param-last
    return function generateServiceCallerError(message = MICROSERVICE.message, code = MICROSERVICE.code, data, status) {
      return new ServiceCallerError({
        code,
        data,
        status,
        request,
        message,
        microservice,
        isOriginatedFromAnotherService: code !== MICROSERVICE.code, // service return non 200 response with error code
      });
    };
  }

  async request({
    microservice, method, path, body: data = {}, query: params = {}, header: headers = {}, timeout = this.config.microservice.timeout,
  }) {
    const { config, logger, requestId } = this;

    const url = `${config.microservice.urls[microservice]}${path}`;

    const start = new Date();
    const request = {
      method,
      url,
      data,
      params: deepObjectIdToString({ value: params }),
      headers: requestId ? { ...headers, requestId } : headers,
      timeout,
      validateStatus: () => true,
    };

    const { log: { isPrettyLoggingEnabled } } = config;
    if (isPrettyLoggingEnabled) {
      const title = `[HTTP Request][Microservice:${microservice}] ${url} [${method}]`;

      logger.debug(title, {
        headers,
        params,
        data,
        timeout,
      }, { $logOptions: { depth: 2 } });
    }

    const generateError = ServiceCaller.generateErrorFunction(microservice, request);
    return axios(request)
      .catch((error) => {
        throw generateError(error.message);
      })
      .then((response) => {
        const elapsed = (+new Date()) - (+start);

        if (isPrettyLoggingEnabled) {
          const title = `[HTTP Response][Microservice:${microservice}] ${url} [${method}][${response.status}]`;

          if (response.status < 400) {
            logger.info(title, response.data, { $logOptions: { depth: 2 } });
          }
          else if (response.status >= 400 && response.status < 500) {
            logger.warn(title, response.data, { $logOptions: { depth: 2 } });
          }
          else {
            logger.error(title, response.data, { $logOptions: { depth: 2 } });
          }
        }
        else {
          logger.debug('service caller response', {
            microservice,
            method,
            url,
            data,
            params,
            headers,
            requestId,
            start,
            elapsed,
            status: response.status,
          });
        }

        if (response.status === 200) {
          return response.data;
        }

        if (response.data.code) {
          throw generateError(response.data.message, response.data.code, response.data.data, response.status);
        }

        throw generateError();
      });
  }
};

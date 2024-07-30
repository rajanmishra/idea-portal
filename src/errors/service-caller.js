'use strict';

module.exports = class ServiceCallerError extends Error {
  constructor({
    message, microservice, request, code, data, isOriginatedFromAnotherService, status,
  }) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.data = data;
    this.status = status;
    this.microservice = microservice;
    this.serviceCallerRequest = request;
    this.isOriginatedFromAnotherService = isOriginatedFromAnotherService;
  }
};

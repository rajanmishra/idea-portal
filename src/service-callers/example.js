'use strict';

const { example: microservice } = require('../constants/microservices');

module.exports = class ExampleServiceCaller {
  constructor({ ServiceCaller }) {
    this.ServiceCaller = ServiceCaller;
  }

  async getDetail({ customId }) {
    const { ServiceCaller } = this;

    return ServiceCaller.request({ microservice, method: 'GET', path: `detail/${customId}` });
  }
};

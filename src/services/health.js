'use strict';

const { ServiceNotReady } = require('../errors/types');

const { MONGOOSE_CONNECTION_READY_STATES } = require('../constants');

module.exports = class HealthService {
  constructor({ catcher, mongooseConnection }) {
    this.catcher = catcher;
    this.mongooseConnection = mongooseConnection;
  }

  // eslint-disable-next-line class-methods-use-this
  getLivenessCheck() {
    return { time: Date.now(), status: 'OK' };
  }

  getReadinessCheck() {
    const { catcher, mongooseConnection } = this;

    const mongoDBConnectionStatus = mongooseConnection.readyState;

    if (mongoDBConnectionStatus !== MONGOOSE_CONNECTION_READY_STATES.CONNECTED) {
      catcher('ServiceNotReady');

      throw new ServiceNotReady();
    }

    return { time: Date.now(), status: 'OK', mongodbConnectionStatus: 'OK' };
  }
};

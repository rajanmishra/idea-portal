'use strict';

const awilix = require('awilix');
const { faker } = require('@faker-js/faker');

const { MONGOOSE_CONNECTION_READY_STATES } = require('../../../src/constants');

module.exports = async (container) => {
  let mongooseConnection;

  const start = async () => {
    mongooseConnection = {
      readyState: faker.random.arrayElement([
        MONGOOSE_CONNECTION_READY_STATES.DISCONNECTED,
        MONGOOSE_CONNECTION_READY_STATES.CONNECTING,
        MONGOOSE_CONNECTION_READY_STATES.DISCONNECTING,
        undefined,
      ]),
    };

    return mongooseConnection;
  };

  const stop = async () => false;

  const register = async () => (
    container.register('mongooseConnection', awilix.asValue(mongooseConnection))
  );

  return {
    start,
    stop,
    register,
  };
};

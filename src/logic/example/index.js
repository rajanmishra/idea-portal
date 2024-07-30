'use strict';

const { EXAMPLE_STATUSES } = require('../../constants');

module.exports = class ExampleLogic {
  static isActive(exampleData) {
    return exampleData.status === EXAMPLE_STATUSES.ACTIVE;
  }
};

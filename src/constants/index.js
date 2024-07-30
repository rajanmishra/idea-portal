'use strict';

const environment = require('./environments');
const errorMessages = require('./error-messages');
const status = require('./statuses');
const httpStatusCode = require('./http-statuses');
const mongoose = require('./mongoose');

module.exports = {
  ...environment,
  ...errorMessages,
  ...status,
  ...httpStatusCode,
  ...mongoose,
};

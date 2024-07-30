'use strict';

const MESSAGES = require('../constants/error-messages');

const { createCustomErrorType } = require('./custom-error');

module.exports = (
  Object.values(MESSAGES)
    .filter((message) => message.parent)
    .reduce((acc, message) => ({
      ...acc,
      [message.error]: (
        createCustomErrorType({
          extendClass: message.parent,
          klass: message.error,
          level: message.level,
          message: message.message,
          code: message.code,
          statusCode: message.statusCode,
        })
      ),
    }), {})
);

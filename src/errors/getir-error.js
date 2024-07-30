'use strict';

module.exports = class GetirError extends Error {
  constructor(level, message, code, data, statusCode = 500) {
    super(message);

    if (this.constructor === GetirError) {
      throw new TypeError('Abstract class "GetirError" cannot be instantiated directly.');
    }

    this.name = this.constructor.name;
    this.level = level;
    this.code = code;
    this.data = data;
    this.statusCode = statusCode;
  }
};

'use strict';

// eslint-disable-next-line max-classes-per-file
const GetirEvent = require('../getir-event');

module.exports.ExampleFailEvent = class ExampleFailEvent extends GetirEvent {
  constructor({ message }) {
    super();

    this.message = message;
  }
};

'use strict';

// eslint-disable-next-line max-classes-per-file
const GetirEvent = require('../getir-event');

module.exports.ExampleSuccessEvent = class ExampleSuccessEvent extends GetirEvent {
  constructor({ customId, customDetail }) {
    super();

    this.customId = customId;
    this.customDetail = customDetail;
  }
};

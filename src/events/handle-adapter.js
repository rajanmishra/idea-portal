'use strict';

const mappingSymbol = Symbol('Mapping');
const defaultSymbol = Symbol('Default');

// eslint-disable-next-line no-empty-function
const noop = async () => {};

module.exports = class EventHandleAdapter {
  constructor(mapping) {
    this[mappingSymbol] = mapping;
    this[defaultSymbol] = mapping[defaultSymbol] || noop;
  }

  async handle(event) {
    const handler = (event.constructor in this[mappingSymbol])
      ? this[mappingSymbol][event.constructor]
      : this[defaultSymbol];

    return handler(event);
  }
};

module.exports.defaultSymbol = defaultSymbol;

'use strict';

const GetirEvent = require('./getir-event');

const adaptersSymbol = Symbol('Adapters');
const catcherSymbol = Symbol('Catcher');

module.exports = class Events {
  // eslint-disable-next-line default-param-last
  constructor(adapters = [], catcher) {
    if (!Array.isArray(adapters)) {
      throw new TypeError('Event adapters must be array.');
    }

    this[adaptersSymbol] = adapters;
    this[catcherSymbol] = catcher;
  }

  destroy() {
    this[adaptersSymbol] = [];
  }

  async triggerEvent(event) {
    if (!(event instanceof GetirEvent)) {
      return async () => {};
    }

    return Promise.all(
      this[adaptersSymbol]
        .map((adapter) => (
          adapter.handle(event)
            .catch((error) => (
              this[catcherSymbol]('EventError', {
                eventName: event.constructor.name,
                eventData: { ...event },
                error: error.message,
              })
            ))
        )),
    );
  }
};

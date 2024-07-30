'use strict';

const awilix = require('awilix');

const Events = require('../../events');
const { makeBootstrapComponent } = require('../utils');

class EventComponent {
  constructor(container) {
    this.events = null;
    this.container = container;
    this.catcher = container.catcher;
  }

  async start() {
    const adapters = await Promise.all(
      awilix
        .listModules(
          ['../../events/adapters/*.js'],
          {
            cwd: __dirname,
          },
        )
        .map((file) => file.path)
        .map(require)
        .map((adapter) => adapter(this.container)),
    );

    this.events = new Events(adapters, this.catcher);
  }

  stop() {
    return this.events.destroy();
  }

  register() {
    return this.events;
  }
}

module.exports = makeBootstrapComponent((container) => new EventComponent(container));

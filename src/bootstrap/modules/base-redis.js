'use strict';

const { createClient } = require('redis');

// This is a base class which all components that use redis should inherit from
class BaseRedis {
  constructor(componentName, config, logger) {
    this.componentName = componentName;
    this.client = createClient({ url: config.url });
    this.logger = logger;
  }

  async start() {
    const { componentName, logger } = this;

    this.client.on('error', (err) => {
      logger.error(`${componentName} Error:`, err);
    });
    this.client.on('ready', () => {
      logger.info(`${componentName} connection is ready.`);
    });
    this.client.on('reconnecting', () => {
      logger.warning(`${componentName} is reconnecting...`);
    });
    this.client.on('end', () => {
      logger.info(`${componentName} connection is ended!`);
    });

    // retry strategy will be added after GT4-890.
    await this.client.connect();
  }

  stop() {
    return this.client.quit();
  }

  register() {
    return this.client;
  }
}

module.exports = BaseRedis;

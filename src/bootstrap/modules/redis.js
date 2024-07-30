'use strict';

const BaseRedis = require('./base-redis');
const { makeBootstrapComponent } = require('../utils');

class RedisComponent extends BaseRedis {}

module.exports = makeBootstrapComponent(({ config: { redis: redisConfig }, logger }) => (
  new RedisComponent('RedisComponent', redisConfig, logger)));

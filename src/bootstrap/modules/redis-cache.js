'use strict';

const BaseRedis = require('./base-redis');
const { makeBootstrapComponent } = require('../utils');

class RedisCacheComponent extends BaseRedis {}

module.exports = makeBootstrapComponent(({ config: { redisCache: redisCacheConfig }, logger }) => (
  new RedisCacheComponent('RedisCacheComponent', redisCacheConfig, logger)));

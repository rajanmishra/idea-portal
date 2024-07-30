'use strict';

const redis = require('redis');
const { faker } = require('@faker-js/faker');

const { redisClient, logger } = require('../../../mocks/modules');
const BaseRedisModule = require('../../../../src/bootstrap/modules/base-redis');

jest.mock('redis');

describe('BaseRedis module', () => {
  it('should call the proper functions with proper params during redis module lifecycle', async () => {
    redis.createClient.mockReturnValue(redisClient);

    const componentName = faker.random.word();
    const config = {
      url: faker.internet.url(),
    };

    const redisModule = new BaseRedisModule(componentName, config, logger);
    expect(redis.createClient).toHaveBeenCalledWith({ url: config.url });

    await redisModule.start();
    expect(redisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('end', expect.any(Function));
    expect(redisClient.connect).toHaveBeenCalled();

    const client = redisModule.register();
    expect(client).toEqual(redisClient);

    await redisModule.stop();
    expect(redisClient.quit).toHaveBeenCalled();
  });
});

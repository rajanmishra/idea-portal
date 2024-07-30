'use strict';

const awilix = require('awilix');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const { logger, mongooseConnection } = require('../../../mocks/modules');
const MongooseModule = require('../../../../src/bootstrap/modules/mongoose');

jest.mock('mongoose');
jest.mock('awilix');

describe('Mongoose module', () => {
  it('should call the proper functions with proper params during mongoose module lifecycle', async () => {
    mongoose.createConnection.mockReturnValue({
      asPromise: jest.fn().mockResolvedValue(mongooseConnection),
    });
    awilix.asValue.mockReturnValue(mongooseConnection);

    const config = {
      mongodb: {
        url: faker.internet.url(),
        minPoolSize: faker.datatype.number(),
        maxPoolSize: faker.datatype.number(),
        serverSelectionTimeoutMS: faker.datatype.number(),
      },
      name: faker.random.word(),
    };

    const container = {
      resolve: jest.fn().mockImplementation((injectedDependencyName) => {
        if (injectedDependencyName === 'config') {
          return config;
        }
        if (injectedDependencyName === 'logger') {
          return logger;
        }

        throw new Error(`Unknown dependency: ${injectedDependencyName}`);
      }),
      register: jest.fn(),
    };

    const { start, stop, register } = await MongooseModule(container);
    expect(container.resolve).toHaveBeenCalledWith('config');
    expect(container.resolve).toHaveBeenCalledWith('logger');

    await start();
    expect(mongoose.createConnection).toHaveBeenCalledWith(config.mongodb.url, {
      appName: config.name,
      autoIndex: false,
      minPoolSize: config.mongodb.minPoolSize,
      maxPoolSize: config.mongodb.maxPoolSize,
      serverSelectionTimeoutMS: config.mongodb.serverSelectionTimeoutMS,
    });
    expect(mongoose.plugin).toHaveBeenCalledWith(expect.any(Function));

    await register();
    expect(container.register).toHaveBeenCalledWith('mongooseConnection', mongooseConnection);
    expect(awilix.asValue).toHaveBeenCalledWith(mongooseConnection);

    await stop();
    expect(mongooseConnection.close).toHaveBeenCalled();
  });
});

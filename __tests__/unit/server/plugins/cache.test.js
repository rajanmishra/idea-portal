'use strict';

const { faker } = require('@faker-js/faker');
const Hapi = require('@hapi/hapi');

const { HTTP_STATUS_CODES } = require('../../../../src/constants');
const cachePlugin = require('../../../../src/server/plugins/cache');

const { TEST_SERVER_PORTS } = require('../../../constants');
const { generateRandomStatusCode } = require('../../../utils');

const cacheKey = 'test-cache-key';
jest.mock('ramda', () => ({
  pipe: jest.fn().mockReturnValue(() => cacheKey),
  isNil: jest.fn().mockImplementation((value) => !value),
}));

describe('cache plugin', () => {
  let server;

  const Sentry = {
    captureException: jest.fn(),
  };
  const RedisCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeAll(async () => {
    server = Hapi.server({
      port: TEST_SERVER_PORTS.CACHE_PLUGIN,
    });

    await server.start();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should let the response return when there is no error and cache disabled', async () => {
    const requestExample = {
      method: faker.internet.httpMethod(),
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responsePayloadExample = JSON.parse(faker.datatype.json());
    const statusCodeExample = generateRandomStatusCode();

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(statusCodeExample),
    });

    await server.register(cachePlugin({ Sentry, RedisCache }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(RedisCache.get).not.toHaveBeenCalled();
    expect(RedisCache.set).not.toHaveBeenCalled();
    expect(JSON.parse(response.payload)).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(statusCodeExample);
  });

  it('should return the cached response when request is already cached', async () => {
    const requestExample = {
      method: 'GET',
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responsePayloadExample = JSON.parse(faker.datatype.json());
    const cachedResponseExample = faker.datatype.json();
    const statusCodeExample = generateRandomStatusCode();

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
          cache: {
            enabled: true,
          },
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(statusCodeExample),
    });

    RedisCache.get.mockResolvedValue(cachedResponseExample);

    await server.register(cachePlugin({ Sentry, RedisCache }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(RedisCache.get).toHaveBeenCalledWith(cacheKey);
    expect(RedisCache.set).not.toHaveBeenCalled();
    expect(response.statusCode).toEqual(HTTP_STATUS_CODES.OK); // Cached response is always returned with 200 status code
    const parsedPayload = JSON.parse(response.payload);
    expect(parsedPayload).toEqual(JSON.parse(cachedResponseExample));
    expect(parsedPayload).not.toEqual(responsePayloadExample);
  });

  it('should cache the response when request is suitable to cache and cache is enabled', async () => {
    const requestExample = {
      method: 'GET',
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const stringifiedResponsePayloadExample = faker.datatype.json();
    const responsePayloadExample = JSON.parse(stringifiedResponsePayloadExample);
    const statusCodeExample = generateRandomStatusCode();

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
          cache: {
            enabled: true,
          },
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(statusCodeExample),
    });

    RedisCache.get.mockResolvedValue(null);
    RedisCache.set.mockResolvedValue(stringifiedResponsePayloadExample);

    await server.register(cachePlugin({ Sentry, RedisCache }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(RedisCache.get).toHaveBeenCalledWith(cacheKey);
    expect(RedisCache.set).toHaveBeenCalled();
    expect(JSON.parse(response.payload)).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(statusCodeExample);
  });

  it('should return the response when request cache get/set fails and cache is enabled', async () => {
    const requestExample = {
      method: 'GET',
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responsePayloadExample = JSON.parse(faker.datatype.json());
    const statusCodeExample = generateRandomStatusCode();

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
          cache: {
            enabled: true,
          },
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(statusCodeExample),
    });

    RedisCache.get.mockRejectedValue(new Error('Redis Error'));
    RedisCache.set.mockRejectedValue(new Error('Redis Error'));

    await server.register(cachePlugin({ Sentry, RedisCache }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(RedisCache.get).toHaveBeenCalledWith(cacheKey);
    expect(RedisCache.set).toHaveBeenCalled();
    expect(JSON.parse(response.payload)).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(statusCodeExample);
  });
});

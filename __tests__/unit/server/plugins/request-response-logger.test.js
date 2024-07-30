'use strict';

const { faker } = require('@faker-js/faker');
const Hapi = require('@hapi/hapi');

const { HTTP_STATUS_CODES } = require('../../../../src/constants');
const requestResponseLoggerPlugin = require('../../../../src/server/plugins/request-response-logger');
const { getRequestIdFromRequest } = require('../../../../src/server/utils');

const { TEST_SERVER_PORTS } = require('../../../constants');
const { generateRandomStatusCode } = require('../../../utils');

jest.mock('../../../../src/server/utils', () => ({
  getRequestIdFromRequest: jest.fn(),
}));
jest.mock('../../../../src/config/index', () => (
  jest.fn().mockReturnValue({ log: { isPrettyLoggingEnabled: true } })
));

describe('request-response-logger plugin when LOG_IS_PRETTY_LOGGING_ENABLED env is true', () => {
  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };

  let server;

  beforeAll(async () => {
    server = Hapi.server({
      port: TEST_SERVER_PORTS.REQUEST_RESPONSE_LOGGER_PLUGIN,
    });

    await server.start();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should call proper logger functions when status code is lower than 400', async () => {
    const requestExample = {
      method: faker.internet.httpMethod(),
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responsePayloadExample = JSON.parse(faker.datatype.json());
    const errorFreeStatusCodeExample = generateRandomStatusCode({ min: 100, max: 399 });

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(errorFreeStatusCodeExample),
    });

    await server.register(requestResponseLoggerPlugin({ logger }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object), { $logOptions: expect.anything() });
    expect(getRequestIdFromRequest).not.toHaveBeenCalled();
    expect(response.request.headers['x-req-start']).toEqual(expect.any(Number));
    expect(logger.info).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object), { $logOptions: expect.anything() });
    expect(JSON.parse(response.payload)).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(errorFreeStatusCodeExample);
  });

  it('should call proper logger functions when status code is 200 and response content type is not json', async () => {
    const requestExample = {
      method: faker.internet.httpMethod(),
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responsePayloadExample = faker.datatype.string();

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(HTTP_STATUS_CODES.OK),
    });

    await server.register(requestResponseLoggerPlugin({ logger }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object), { $logOptions: expect.anything() });
    expect(getRequestIdFromRequest).not.toHaveBeenCalled();
    expect(response.request.headers['x-req-start']).toEqual(expect.any(Number));
    expect(logger.info).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object), { $logOptions: expect.anything() });
    expect(response.payload).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(HTTP_STATUS_CODES.OK);
  });

  it('should call proper logger functions when status code is 4xx client errors', async () => {
    const requestExample = {
      method: faker.internet.httpMethod(),
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responsePayloadExample = JSON.parse(faker.datatype.json());
    const statusCode4XX = generateRandomStatusCode({ min: 400, max: 499 });

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(statusCode4XX),
    });

    await server.register(requestResponseLoggerPlugin({ logger }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object), { $logOptions: expect.anything() });
    expect(getRequestIdFromRequest).not.toHaveBeenCalled();
    expect(response.request.headers['x-req-start']).toEqual(expect.any(Number));
    expect(logger.warn).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object));
    expect(JSON.parse(response.payload)).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(statusCode4XX);
  });

  it('should call proper logger functions when status code is 5xx server errors', async () => {
    const requestExample = {
      method: faker.internet.httpMethod(),
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responsePayloadExample = JSON.parse(faker.datatype.json());
    const statusCode5XX = generateRandomStatusCode({ min: 500, max: 599 });

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
        },
      },
      handler: (_request, h) => h.response(responsePayloadExample).code(statusCode5XX),
    });

    await server.register(requestResponseLoggerPlugin({ logger }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object), { $logOptions: expect.anything() });
    expect(getRequestIdFromRequest).not.toHaveBeenCalled();
    expect(response.request.headers['x-req-start']).toEqual(expect.any(Number));
    expect(logger.error).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object));
    expect(JSON.parse(response.payload)).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(statusCode5XX);
  });
});

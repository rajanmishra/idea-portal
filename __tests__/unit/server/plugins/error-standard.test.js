'use strict';

const { faker } = require('@faker-js/faker');
const Hapi = require('@hapi/hapi');

const { TEST } = require('../../../../src/constants/error-messages');
const { TestError } = require('../../../../src/errors/types');
const errorStandardPlugin = require('../../../../src/server/plugins/error-standard');
const { getRequestIdFromRequest, stringFormat } = require('../../../../src/server/utils');

const { TEST_SERVER_PORTS } = require('../../../constants');
const { generateRandomStatusCode } = require('../../../utils');

jest.mock('../../../../src/server/utils', () => ({
  getRequestIdFromRequest: jest.fn(),
  stringFormat: jest.fn(),
}));
jest.mock('../../../../src/config/index', () => (
  jest.fn().mockReturnValue({ log: { isPrettyLoggingEnabled: false } })
));

describe('error-standard plugin', () => {
  const logger = {
    log: jest.fn(),
  };
  const Sentry = {
    captureEvent: jest.fn(),
    captureException: jest.fn(),
  };

  let server;
  beforeAll(async () => {
    server = Hapi.server({
      port: TEST_SERVER_PORTS.ERROR_STANDARD_PLUGIN,
    });

    await server.start();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should let the response flow when there is no error', async () => {
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

    await server.register(errorStandardPlugin({ logger, Sentry }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const response = await server.inject(requestExample);

    expect(getRequestIdFromRequest).not.toHaveBeenCalled();
    expect(stringFormat).not.toHaveBeenCalled();
    expect(JSON.parse(response.payload)).toEqual(responsePayloadExample);
    expect(response.statusCode).toEqual(statusCodeExample);
  });

  it('should log and return the response when an error is thrown', async () => {
    const requestExample = {
      method: faker.internet.httpMethod(),
      url: `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`,
    };
    const responseErrorExample = JSON.parse(faker.datatype.json());

    server.route({
      method: requestExample.method,
      path: requestExample.url,
      options: {
        plugins: {
          logging: true,
        },
      },
      handler: () => new TestError(responseErrorExample),
    });

    await server.register(errorStandardPlugin({ logger, Sentry }).map((plugin) => ({ ...plugin, multiple: true })));

    requestExample.payload = {
      password: faker.datatype.string(),
      oldPassword: faker.datatype.string(),
      newPassword: faker.datatype.string(),
      newPasswordAgain: faker.datatype.string(),
      test: faker.datatype.string(),
    };

    const { payload } = await server.inject(requestExample);

    const parsedPayload = JSON.parse(payload);

    expect(getRequestIdFromRequest).toHaveBeenCalled();
    expect(stringFormat).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(expect.anything(String), expect.anything(Object));
    expect(parsedPayload.data).toEqual(responseErrorExample);
    expect(parsedPayload.error).toEqual(TEST.error);
    expect(parsedPayload.code).toEqual(TEST.code);
  });
});

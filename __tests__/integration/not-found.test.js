'use strict';

const { faker } = require('@faker-js/faker');
const { setupServer } = require('../helper');
const { TEST_SERVER_PORTS } = require('../constants');
const { HTTP_STATUS_CODES } = require('../../src/constants');

describe('NotFound Controller', () => {
  let server;
  let stop;

  beforeAll(async () => {
    [server, stop] = await setupServer({ port: TEST_SERVER_PORTS.NOT_FOUND });
  });

  afterAll(async () => {
    await stop();
  });
  it('should response with not found', async () => {
    const randomPath = `/${faker.random.word().toLowerCase()}${faker.datatype.number()}`;

    const { statusCode, statusMessage, result } = await server.inject({
      method: faker.internet.httpMethod(),
      url: randomPath,
    });

    expect(statusCode).toEqual(HTTP_STATUS_CODES.NOT_FOUND);
    expect(statusMessage).toEqual('Not Found');
    expect(result.code).toEqual('ResourceNotFound');
    expect(result.message).toEqual(`${randomPath} does not exist`);
  });
});

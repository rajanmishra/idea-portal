'use strict';

process.env.NODE_ENV = 'test';
const { setupServer } = require('../helper');
const { TEST_SERVER_PORTS } = require('../constants');
const { HTTP_STATUS_CODES } = require('../../src/constants');
const DBManager = require('../helpers/dbManager');
const DBSeeder = require('../helpers/dbSeeder');

let container;
let server;
let stop;

jest.setTimeout(10000);
describe('Example Test', () => {
  const dbManager = new DBManager();

  beforeAll(async () => {
    await dbManager.start();
    const dbUrl = await dbManager.getUri();
    const dbName = await dbManager.getDbName();
    const seeder = new DBSeeder(dbUrl, dbName);
    await seeder.seed();

    [server, stop, container] = await setupServer({ port: TEST_SERVER_PORTS.EXAMPLE });
    await dbManager.register(container);
  });

  afterAll(async () => {
    await dbManager.stop();
    await stop();
  });

  describe('Example Route', () => {
    it('should get data from database', async () => {
      const { payload, statusCode } = await server.inject({
        method: 'GET',
        url: '/example/all-data-from-db',
      });
      expect(statusCode).toBe(HTTP_STATUS_CODES.OK);
      expect(payload).toBeDefined();
    });

    it('should call /error-example and fail ', async () => {
      const { payload, statusCode } = await server.inject({
        method: 'GET',
        url: '/error-example',
      });
      expect(statusCode).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(payload).toBeDefined();
    });

    it('should call /example/all-data ', async () => {
      const { payload, statusCode } = await server.inject({
        method: 'GET',
        url: '/example/all-data',
      });
      expect(statusCode).toBe(HTTP_STATUS_CODES.OK);
      expect(payload).toBeDefined();
    });
  });
});

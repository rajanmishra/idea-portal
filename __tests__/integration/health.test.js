'use strict';

const Joi = require('joi');

const { setupServer } = require('../helper');
const DBManager = require('../helpers/dbManager');
const MongooseBootstrapNotConnectedMock = require('../mocks/bootstraps/mongoose-not-connected');

const { TEST_SERVER_PORTS } = require('../constants');
const { HTTP_STATUS_CODES, SERVICE_NOT_READY } = require('../../src/constants');

describe('Health Check when DB connection is ready', () => {
  const dbManager = new DBManager();

  let container;
  let server;
  let stop;

  beforeAll(async () => {
    await dbManager.start();
    [server, stop, container] = await setupServer({ port: TEST_SERVER_PORTS.HEALTH_DB_CONNECTION_READY });
    await dbManager.register(container);
  });

  afterAll(async () => {
    await dbManager.stop();
    await stop();
  });

  it('should call /live endpoint and return response with success', async () => {
    const { payload } = await server.inject('/live');
    const schema = Joi.object().keys({
      status: Joi.string().required(),
      time: Joi.number(),
    }).required();

    const jsonPayload = JSON.parse(payload);
    Joi.assert(jsonPayload, schema, "Couldn't match the /live result with the expected schema.");

    const { status } = jsonPayload;
    expect(status).toBe('OK');
  });

  it('should call /ready endpoint and return response with success', async () => {
    const { payload } = await server.inject('/ready');
    const schema = Joi.object().keys({
      mongodbConnectionStatus: Joi.string().required(),
      status: Joi.string().required(),
      time: Joi.number(),
    }).required();

    const jsonPayload = JSON.parse(payload);
    Joi.assert(jsonPayload, schema, "Couldn't match the /ready result with the expected schema.");

    const { mongodbConnectionStatus, status } = jsonPayload;
    expect(mongodbConnectionStatus).toBe('OK');
    expect(status).toBe('OK');
  });
});

describe('Health Check when DB connection is not ready', () => {
  let server;
  let stop;

  beforeAll(async () => {
    [server, stop] = await setupServer({
      extraComponents: {
        Mongoose: MongooseBootstrapNotConnectedMock,
      },
      port: TEST_SERVER_PORTS.HEALTH_DB_CONNECTION_NOT_READY,
    });
  });

  afterAll(async () => {
    await stop();
  });

  it('should call /live endpoint and return response with success', async () => {
    const { payload } = await server.inject('/live');
    const schema = Joi.object().keys({
      status: Joi.string().required(),
      time: Joi.number(),
    }).required();

    const jsonPayload = JSON.parse(payload);
    Joi.assert(jsonPayload, schema, "Couldn't match the /live result with the expected schema.");

    const { status } = jsonPayload;
    expect(status).toBe('OK');
  });

  it('should call /ready endpoint and return response with 503 status code and ServiceNotReady error', async () => {
    const { payload, statusCode } = await server.inject('/ready');

    const schema = Joi.object().keys({
      code: Joi.number().required(),
      error: Joi.string(),
      message: Joi.string(),
    }).required();

    const jsonPayload = JSON.parse(payload);
    Joi.assert(jsonPayload, schema, "Couldn't match the /ready result with the expected schema.");

    const { code, error, message } = jsonPayload;
    expect(statusCode).toBe(HTTP_STATUS_CODES.SERVICE_UNAVAILABLE);
    expect(code).toBe(SERVICE_NOT_READY.code);
    expect(error).toBe(SERVICE_NOT_READY.error);
    expect(message).toBe('Internal Server Error');
  });
});

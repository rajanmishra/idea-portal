'use strict';

const { faker } = require('@faker-js/faker');
const util = require('util');
const winston = require('winston');

const { TestError } = require('../../../src/errors/types');
const { TEST } = require('../../../src/constants/error-messages');

const loggerMock = {
  warn: () => jest.fn(),
  info: () => jest.fn(),
  debug: () => jest.fn(),
  error: () => jest.fn(),
  log: () => jest.fn(),
};

const winstonLogLevelsMock = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    json: jest.fn(),
    prettyPrint: jest.fn(),
    splat: jest.fn(),
    simple: jest.fn(),
  },
  config: {
    cli: {
      levels: winstonLogLevelsMock,
    },
  },
  createLogger: jest.fn().mockReturnValue(loggerMock),
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

const {
  logger: loggerModule,
  _createErrorReplacer,
  _formatLogArgsToPrettify,
  _prettyLoggingFormat,
} = require('../../../src/logger/index');

describe('logger module creation tests', () => {
  it('should call the related winston functions when config isPrettyLoggingEnabled is false', () => {
    const config = {
      log: {
        name: 'microservice-template',
        version: '1.0.0',
        env: 'dev',
        isPrettyLoggingEnabled: false,
        level: 'DEBUG',
      },
    };

    loggerModule({ config });

    expect(winston.createLogger).toHaveBeenCalled();
    expect(winston.format.combine).toHaveBeenCalled();
    expect(winston.format.json).toHaveBeenCalled();
    expect(winston.format.prettyPrint).not.toHaveBeenCalled();
    expect(winston.format.splat).not.toHaveBeenCalled();
    expect(winston.format.simple).not.toHaveBeenCalled();
    expect(winston.format.timestamp).toHaveBeenCalled();
  });

  it('should call the related winston functions when config isPrettyLoggingEnabled is true', () => {
    const config = {
      log: {
        name: 'microservice-template',
        version: '1.0.0',
        env: 'dev',
        isPrettyLoggingEnabled: true,
        level: 'DEBUG',
      },
    };

    loggerModule({ config });

    expect(winston.createLogger).toHaveBeenCalled();
    expect(winston.format.combine).toHaveBeenCalled();
    expect(winston.format.json).toHaveBeenCalled();
    expect(winston.format.prettyPrint).toHaveBeenCalled();
    expect(winston.format.splat).toHaveBeenCalled();
    expect(winston.format.simple).toHaveBeenCalled();
    expect(winston.format.timestamp).toHaveBeenCalled();
  });
});

describe('createErrorReplacer function', () => {
  it('should return undefined value when no parameter is passed', () => {
    const replacerFunction = _createErrorReplacer();

    const replacedValue = replacerFunction();

    expect(replacedValue).toEqual(undefined);
  });

  it('should return the string value itself when a string value is passed as second parameter', () => {
    const stringValue = faker.datatype.string();

    const replacerFunction = _createErrorReplacer();

    const replacedValue = replacerFunction(undefined, stringValue);

    expect(replacedValue).toEqual(stringValue);
  });

  it('should return the number value itself when a number value is passed as second parameter', () => {
    const numberValue = faker.datatype.number();

    const replacerFunction = _createErrorReplacer();

    const replacedValue = replacerFunction(undefined, numberValue);

    expect(replacedValue).toEqual(numberValue);
  });

  it('should return the boolean value itself when a boolean value is passed as second parameter', () => {
    const booleanValue = faker.datatype.boolean();

    const replacerFunction = _createErrorReplacer();

    const replacedValue = replacerFunction(undefined, booleanValue);

    expect(replacedValue).toEqual(booleanValue);
  });

  it('should return the base64 string itself when buffer value is passed as second parameter', () => {
    const bufferValue = Buffer.from(faker.datatype.string());

    const replacerFunction = _createErrorReplacer();

    const replacedValue = replacerFunction(undefined, bufferValue);

    expect(replacedValue).toEqual(bufferValue.toString('base64'));
  });

  it('should return the error itself when an error is passed as second parameter', () => {
    const errorDataExample = JSON.parse(faker.datatype.json());

    const replacerFunction = _createErrorReplacer();

    const {
      code, data, level, name,
    } = replacerFunction(undefined, new TestError(errorDataExample));

    expect(code).toEqual(TEST.code);
    expect(level).toEqual(TEST.level);
    expect(data).toEqual(errorDataExample);
    expect(name).toEqual(TEST.error);
  });

  it('should return the error itself by filtering ignored fields when an error is passed as second parameter', () => {
    const errorDataExample = JSON.parse(faker.datatype.json());

    const fieldsToIgnore = ['code', 'level', 'name'];

    const replacerFunction = _createErrorReplacer(fieldsToIgnore);

    const {
      code, data, level, name,
    } = replacerFunction(undefined, new TestError(errorDataExample));

    expect(code).toEqual(undefined);
    expect(level).toEqual(undefined);
    expect(name).toEqual(undefined);
    expect(data).toEqual(errorDataExample);
  });
});

describe('formatLogArgsToPrettify function', () => {
  it('should return the formatted arguments without $logOptions, requestId, message', () => {
    const $logOptions = JSON.parse(faker.datatype.json());
    const requestId = faker.datatype.uuid();
    const message = faker.lorem.sentence();
    const level = faker.datatype.string();
    const data = JSON.parse(faker.datatype.json());

    const formattedArgs = _formatLogArgsToPrettify({
      $logOptions,
      requestId,
      message,
      level,
      data,
    });

    expect(formattedArgs).toStrictEqual({
      level,
      data,
    });
  });

  it('should return the formatted arguments without $logOptions, requestId, message, level', () => {
    const $logOptions = JSON.parse(faker.datatype.json());
    const requestId = faker.datatype.uuid();
    const message = faker.lorem.sentence();
    const level = faker.random.arrayElement(Object.keys(winstonLogLevelsMock));
    const data = JSON.parse(faker.datatype.json());

    const formattedArgs = _formatLogArgsToPrettify({
      $logOptions,
      requestId,
      message,
      level,
      data,
    });

    expect(formattedArgs).toStrictEqual({
      data,
    });
  });
});

describe('prettyLoggingFormat function', () => {
  it('should return level and formatted message when provided message is string', () => {
    const depth = faker.datatype.number({ min: 1, max: 10 });
    const $logOptions = { ...JSON.parse(faker.datatype.json()), depth };
    const customLevelValue = faker.lorem.sentence();
    const customTimestampValue = faker.lorem.sentence();
    const message = faker.lorem.sentence();
    const randomData = JSON.parse(faker.datatype.json());
    const requestId = faker.datatype.uuid();
    const timestamp = faker.date.recent();
    const winstonLevel = faker.random.arrayElement(Object.keys(winstonLogLevelsMock));
    const messageArgs = JSON.stringify({
      ...randomData,
      $logOptions,
      level: customLevelValue,
      timestamp: customTimestampValue,
      message,
      requestId,
    });

    const { level: returnedLevel, message: formattedMessage } = _prettyLoggingFormat({
      level: customLevelValue,
      message,
      timestamp,
      [Symbol.for('message')]: messageArgs,
      [Symbol.for('level')]: winstonLevel,
    });

    expect(returnedLevel).toStrictEqual(winstonLevel);
    const expectedFormattedArgs = util.inspect({ ...randomData, timestamp: customTimestampValue, level: customLevelValue }, { depth, compact: false });
    expect(formattedMessage).toStrictEqual(`[${timestamp}]: ${message}\n${expectedFormattedArgs}`);
  });

  it('should return level and formatted message when provided message is object', () => {
    const depth = faker.datatype.number({ min: 1, max: 10 });
    const $logOptions = { ...JSON.parse(faker.datatype.json()), depth };
    const customLevelValue = faker.lorem.sentence();
    const customTimestampValue = faker.lorem.sentence();
    const message = JSON.parse(faker.datatype.json());
    const randomData = JSON.parse(faker.datatype.json());
    const requestId = faker.datatype.uuid();
    const timestamp = faker.date.recent();
    const winstonLevel = faker.random.arrayElement(Object.keys(winstonLogLevelsMock));
    const messageArgs = JSON.stringify({
      ...randomData,
      $logOptions,
      level: customLevelValue,
      timestamp: customTimestampValue,
      message,
      requestId,
    });

    const { level: returnedLevel, message: formattedMessage } = _prettyLoggingFormat({
      level: customLevelValue,
      message,
      timestamp,
      [Symbol.for('message')]: messageArgs,
      [Symbol.for('level')]: winstonLevel,
    });

    expect(returnedLevel).toStrictEqual(winstonLevel);
    const expectedFormattedMessage = util.inspect(message, { depth, compact: false });
    const expectedFormattedArgs = util.inspect({ ...randomData, timestamp: customTimestampValue, level: customLevelValue }, { depth, compact: false });
    expect(formattedMessage).toStrictEqual(`[${timestamp}]: ${expectedFormattedMessage}\n${expectedFormattedArgs}`);
  });
});

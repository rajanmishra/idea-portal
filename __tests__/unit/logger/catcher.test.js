'use strict';

const { faker } = require('@faker-js/faker');
const { TestError } = require('../../../src/errors/types');
const { TEST } = require('../../../src/constants/error-messages');

const logger = {
  log: jest.fn(),
};

const Sentry = {
  withScope: jest.fn(),
};

const { catcher: catcherModule } = require('../../../src/logger/catcher');

describe('catcher module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call the related functions with correct parameters when level param is not passed', () => {
    const catcher = catcherModule({ Sentry, logger });

    const extra = JSON.parse(faker.datatype.json());
    const defaultLevel = 'error';

    catcher(new TestError(extra), extra);

    expect(Sentry.withScope).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(defaultLevel, TEST.message, extra);
  });

  it('should call the related functions with correct parameters when level param is passed', () => {
    const catcher = catcherModule({ Sentry, logger });

    const extra = JSON.parse(faker.datatype.json());
    const level = 'warning';

    catcher(new TestError(extra), extra, level);

    expect(Sentry.withScope).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(level, TEST.message, extra);
  });

  it('should call the related functions with correct parameters when level param is not passed and instead of an error object message is passed', () => {
    const catcher = catcherModule({ Sentry, logger });

    const extra = JSON.parse(faker.datatype.json());
    const message = faker.random.word();
    const defaultLevel = 'error';

    catcher(message, extra);

    expect(Sentry.withScope).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(defaultLevel, message, extra);
  });
});

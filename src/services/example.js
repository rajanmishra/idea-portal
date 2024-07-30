'use strict';

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { ExampleError } = require('../errors/types');
const { ExampleFailEvent, ExampleSuccessEvent } = require('../events/types');

const ExampleLogic = require('../logic/example');

module.exports = class ExampleService {
  constructor({
    logger,
    catcher,
    Event,
    ExampleDataAccess,
    ExampleServiceCaller,
  }) {
    this.logger = logger;
    this.catcher = catcher;
    this.Event = Event;

    this.ExampleDataAccess = ExampleDataAccess;

    this.ExampleServiceCaller = ExampleServiceCaller;
  }

  async getIndex() {
    const { catcher, Event } = this;
    const customData = 'hello';
    // send business logic errors to sentry if needed.
    catcher('ExampleError', {
      customData,
      service: 'ExampleService',
    });

    await Event.triggerEvent(new ExampleFailEvent({ customId: new ObjectId(), customDetail: customData }));

    // throw error for response.
    throw new ExampleError({
      customData: 'hello',
      service: 'ExampleService',
    });
  }

  async getAllData() {
    const {
      logger,
      Event,
      ExampleDataAccess,
      ExampleServiceCaller,
    } = this;

    const exampleData = await ExampleDataAccess.getAllData();
    const filteredData = exampleData.filter(ExampleLogic.isActive);

    // log some variables with debug level.
    logger.debug('very important data debug', {
      exampleData,
      filteredData,
    });

    const customId = new ObjectId();
    const customDetail = await ExampleServiceCaller.getDetail({ customId });

    // trigger event.
    await Event.triggerEvent(new ExampleSuccessEvent({ customId, customDetail }));

    return {
      data: filteredData,
    };
  }

  async getAllDataFromDB() {
    const {
      ExampleDataAccess,
    } = this;

    const exampleData = await ExampleDataAccess.getAllDataFromDB();
    return {
      data: exampleData,
    };
  }
};

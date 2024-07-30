'use strict';

const exampleFormatter = require('../../formatters/example');

module.exports = class ExampleController {
  constructor({ ExampleService }) {
    this.ExampleService = ExampleService;
  }

  async getIndex() {
    const { ExampleService } = this;

    await ExampleService.getIndex();
  }

  async getAllData(/* request */) {
    const { ExampleService } = this;

    // const { paramField } = request.params;
    // const { queryField } = request.query;
    // const { postField, anotherPostField } = request.payload;

    const { data } = await ExampleService.getAllData(/* { paramField, queryField, postField, anotherPostField, } */);

    return {
      data: (
        data
          .map(exampleFormatter)
      ),
    };
  }

  async getAllDataFromDB() {
    const { ExampleService } = this;
    const { data } = await ExampleService.getAllDataFromDB();

    return {
      data: (
        data
          .map(exampleFormatter)
      ),
    };
  }
};

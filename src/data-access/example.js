'use strict';

const { EXAMPLE_STATUSES } = require('../constants');

module.exports = class ExampleDataAccess {
  constructor({ ExampleModel }) {
    this.ExampleModel = ExampleModel;
  }

  async getAllData() {
    const { ExampleModel } = this;
    return (
      ExampleModel
        .find({
          status: EXAMPLE_STATUSES.ACTIVE,
        })
        .lean()
        .exec()
    );
  }

  async getAllDataFromDB() {
    const { ExampleModel } = this;
    return ExampleModel.find().lean().exec();
  }
};

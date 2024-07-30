'use strict';

// Directory name must be plural because of mongoose
const mongoose = require('mongoose');
const exampleFactory = require('../../helpers/factories/example');

const { ObjectId } = mongoose.Types;

module.exports = exampleFactory.build(
  {
    _id: new ObjectId('5cece9d5d86a7c699dcd7f12'),
    name: 'Test Name',
    status: 100,
  },
);

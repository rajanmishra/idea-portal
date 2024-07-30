'use strict';

const { Factory } = require('rosie');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const { ObjectId } = mongoose.Types;

module.exports = new Factory().attrs(
  {
    _id: new ObjectId(),
    name: faker.random.words(3),
    status: faker.random.arrayElement(['100', '200']),
  },
);

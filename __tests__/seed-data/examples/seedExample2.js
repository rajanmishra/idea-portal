'use strict';

// Directory name must be plural because of mongoose
const exampleFactory = require('../../helpers/factories/example');

module.exports = exampleFactory.build(); // this will create random data from factory's fakers data

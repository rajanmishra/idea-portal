'use strict';

const { promisify } = require('util');

const { faker } = require('@faker-js/faker');

const { HTTP_STATUS_CODES } = require('../src/constants');

const delay = promisify(setTimeout);

const generateRandomStatusCode = ({ min = 100, max = 599 } = {}) => {
  const randomStatusCode = faker.datatype.number({ min, max });

  // HTTP 204(No Content) and 304(Not Modified) status codes returns empty payload in the response by Hapi and fails the test during the response validation.
  const statusCodesWithEmptyPayload = [HTTP_STATUS_CODES.NO_CONTENT, HTTP_STATUS_CODES.NOT_MODIFIED];

  return statusCodesWithEmptyPayload.includes(randomStatusCode) ? randomStatusCode - 1 : randomStatusCode;
};

const parseJsonFromOutput = (items) => {
  const lines = items.join('').split('\n');
  const filteredLines = lines.filter((line) => line.trim().length);
  return filteredLines.map((line) => {
    try {
      return JSON.parse(line);
    }
    catch (err) {
      throw new Error(`Unable to parse line "${line}" as json, error: ${err}.`);
    }
  });
};

module.exports = {
  delay,
  generateRandomStatusCode,
  parseJsonFromOutput,
};

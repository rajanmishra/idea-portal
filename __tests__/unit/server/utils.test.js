'use strict';

const { createHash } = require('crypto');
const { faker } = require('@faker-js/faker');

const {
  generateMD5Hash,
  getRequestIdFromRequest,
  stringFormat,
} = require('../../../src/server/utils');

describe('generateMD5Hash function', () => {
  it('should return the hashed string', () => {
    const string = faker.random.word();
    const hashedString = generateMD5Hash(string);

    expect(hashedString).toEqual(createHash('md5').update(string).digest('hex'));
  });
});

describe('stringFormat function', () => {
  it('should format the one length string inside the curly bracket with given elements of the data array', () => {
    const str = '{0}{1}{2}';
    const data = [faker.datatype.string(), faker.datatype.uuid(), faker.datatype.number()];
    const formattedString = stringFormat({ str, data });

    expect(formattedString).toEqual(`${data[0]}${data[1]}${data[2]}`);
  });
});

describe('getRequestIdFromRequest function', () => {
  it('should return requestId in the headers', () => {
    const randomId = faker.datatype.uuid();

    const request = {
      headers: { requestid: randomId },
    };

    const requestId = getRequestIdFromRequest({ request });

    expect(requestId).toEqual(randomId);
  });

  it('should return the requestId in the info', () => {
    const randomId = faker.datatype.uuid();

    const request = {
      headers: {},
      info: { id: randomId },
    };

    const requestId = getRequestIdFromRequest({ request });

    expect(requestId).toEqual(randomId);
  });

  it('should return undefined if the requestId does not exist in the header or info', () => {
    const request = {
      headers: {},
      info: {},
    };

    const requestId = getRequestIdFromRequest({ request });

    expect(requestId).toEqual(undefined);
  });
});

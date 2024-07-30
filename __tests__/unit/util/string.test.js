'use strict';

const { faker } = require('@faker-js/faker');
const { Types: { ObjectId } } = require('mongoose');

const { deepObjectIdToString } = require('../../../src/utils/string');

describe('deepObjectIdToString function', () => {
  it('should return string converted ObjectId value when ObjectId is passed as value', () => {
    const value = new ObjectId();

    const returnedValue = deepObjectIdToString({ value });

    expect(returnedValue).toEqual(value.toString());
    expect(ObjectId.isValid(returnedValue)).toEqual(true);
  });

  it('should return the passed array as it is when there is no ObjectId element in the array', () => {
    const value = faker.datatype.array();

    const returnedValue = deepObjectIdToString({ value });

    expect(Array.isArray(returnedValue)).toEqual(true);
    expect(returnedValue).toEqual(value);
  });

  it('should return the passed array as value but only converting ObjectId elements to string', () => {
    const objectIdValue1 = new ObjectId();
    const objectIdValue2 = new ObjectId();
    const randomArray = faker.datatype.array();
    const value = [
      objectIdValue1,
      ...randomArray,
      objectIdValue2,
    ];

    const expectedOutput = [
      objectIdValue1.toString(),
      ...randomArray,
      objectIdValue2.toString(),
    ];

    const returnedValue = deepObjectIdToString({ value });

    expect(Array.isArray(returnedValue)).toEqual(true);
    expect(returnedValue).toEqual(expectedOutput);
  });

  it('should return the passed object as it is when there is no ObjectId value in the object', () => {
    const value = JSON.parse(faker.datatype.json());

    const returnedValue = deepObjectIdToString({ value });

    expect(typeof returnedValue).toEqual('object');
    expect(returnedValue).toEqual(value);
  });

  it('should return the passed object as value but only converting ObjectId values to string', () => {
    const objectIdValue1 = new ObjectId();
    const objectIdValue2 = new ObjectId();
    const randomObject = JSON.parse(faker.datatype.json());
    const value = {
      key1: objectIdValue1,
      ...randomObject,
      key2: objectIdValue2,
    };

    const expectedOutput = {
      key1: objectIdValue1.toString(),
      ...randomObject,
      key2: objectIdValue2.toString(),
    };

    const returnedValue = deepObjectIdToString({ value });

    expect(typeof returnedValue).toEqual('object');
    expect(returnedValue).toEqual(expectedOutput);
  });

  it('should return the passed object but only converting ObjectId values to string even if they exist in deeper levels', () => {
    const objectId1 = new ObjectId();
    const objectId2 = new ObjectId();
    const objectId3 = new ObjectId();
    const objectId4 = new ObjectId();
    const randomArray = faker.datatype.array();
    const randomObject = JSON.parse(faker.datatype.json());
    const value = {
      first: {
        second: {
          third: {
            fourth: {
              ...randomObject,
              objectId1,
              objectId2,
              randomArray: [
                objectId3,
                ...randomArray,
                objectId4,
              ],
            },
          },
        },
      },
    };

    const expectedOutput = {
      first: {
        second: {
          third: {
            fourth: {
              ...randomObject,
              objectId1: objectId1.toString(),
              objectId2: objectId2.toString(),
              randomArray: [
                objectId3.toString(),
                ...randomArray,
                objectId4.toString(),
              ],
            },
          },
        },
      },
    };

    const returnedValue = deepObjectIdToString({ value });

    expect(typeof returnedValue).toEqual('object');
    expect(returnedValue).toEqual(expectedOutput);
  });

  it('should return undefined value itself', () => {
    const value = undefined;

    const returnedValue = deepObjectIdToString({ value });

    expect(returnedValue).toEqual(undefined);
    expect(typeof returnedValue).toEqual('undefined');
  });

  it('should return the number value itself', () => {
    const value = faker.datatype.number();

    const returnedValue = deepObjectIdToString({ value });

    expect(returnedValue).toEqual(value);
    expect(typeof returnedValue).toEqual('number');
  });

  it('should return the empty string value itself', () => {
    const value = '';

    const returnedValue = deepObjectIdToString({ value });

    expect(returnedValue).toEqual(value);
    expect(typeof returnedValue).toEqual('string');
  });

  it('should return the string value itself', () => {
    const value = faker.random.word();

    const returnedValue = deepObjectIdToString({ value });

    expect(returnedValue).toEqual(value);
    expect(typeof returnedValue).toEqual('string');
  });

  it('should return the boolean value itself', () => {
    const value = faker.datatype.boolean();

    const returnedValue = deepObjectIdToString({ value });

    expect(returnedValue).toEqual(value);
    expect(typeof returnedValue).toEqual('boolean');
  });
});

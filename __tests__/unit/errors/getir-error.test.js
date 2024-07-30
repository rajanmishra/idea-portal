'use strict';

const GetirError = require('../../../src/errors/getir-error');

describe('GetirError', () => {
  it('should throw an error during instantiation', () => {
    expect(() => new GetirError()).toThrow('Abstract class "GetirError" cannot be instantiated directly.');
  });
});

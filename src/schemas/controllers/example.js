'use strict';

const Joi = require('../../utils/joi');

const exampleSchema = require('../models/example');

module.exports = {
  getIndex: {
    validate: {},
    response: {
      schema: (
        Joi
          .object()
          .keys({
            code: Joi.number(),
            error: Joi.string(),
            message: Joi.string(),
          })
          .label('Get Index Response Schema')
      ),
    },
  },
  getAllData: {
    validate: {},
    response: {
      schema: (
        Joi
          .object()
          .keys({
            data: (
              Joi
                .array()
                .items(exampleSchema)
            ),
          })
          .label('Get All Data Response Schema')
      ),
    },
  },
};

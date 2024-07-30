'use strict';

const Joi = require('../../utils/joi');

module.exports = {
  getLivenessCheck: {
    validate: {},
    response: {
      schema: (
        Joi
          .object()
          .keys({
            time: Joi.date().timestamp(),
            status: Joi.string(),
          })
          .label('Liveness Check Response Schema')
      ),
    },
  },
  getReadinessCheck: {
    validate: {},
    response: {
      schema: (
        Joi
          .object()
          .keys({
            time: Joi.date().timestamp(),
            status: Joi.string(),
            mongodbConnectionStatus: Joi.string(),
          })
          .label('Readiness Check Response Schema')
      ),
    },
  },
};

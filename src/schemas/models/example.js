'use strict';

const Joi = require('../../utils/joi');

module.exports = (
  Joi
    .object()
    .keys({
      name: Joi.string(),
      status: Joi.number(),
      children: (
        Joi
          .array()
          .items(
            Joi
              .objectId(),
          )
      ),
    })
    .label('Example Schema')
);

'use strict';

const Joi = require('joi');
const { joiObjectIdExtension } = require('@getir/getir-helper/joi');

module.exports = Joi.extend(joiObjectIdExtension);

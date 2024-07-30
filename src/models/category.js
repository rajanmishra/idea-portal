'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const { STATUSES } = require('../constants');
const { buildScheme } = require('./buildScheme');

const Category = buildScheme(
  {
    title: { type: String },
    description: { type: String },
    status: { type: Number, enum: Object.values(STATUSES), default: STATUSES.ACTIVE },
    parentId: { type: ObjectId, ref: 'Category' },
  },
);

module.exports = ({ mongooseConnection }) => mongooseConnection.model('category', Category);

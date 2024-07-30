'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const { STATUSES } = require('../constants');
const { buildScheme } = require('./buildScheme');

const Comment = buildScheme(
  {
    comment: { type: String },
    ideaId: { type: ObjectId, ref: 'Idea' },
    parentId: { type: ObjectId, ref: 'Comment' },
    status: { type: Number, enum: Object.values(STATUSES), default: STATUSES.ACTIVE },
  },
);

module.exports = ({ mongooseConnection }) => mongooseConnection.model('comment', Comment);

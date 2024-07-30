'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const { STATUSES } = require('../constants');
const { buildScheme } = require('./buildScheme');

const Idea = buildScheme(
  {
    title: { type: String },
    description: { type: String },
    attachments: [{
      type: { type: String },
      name: { type: String },
      isCover: { type: Boolean },
      sequence: { type: Number },
      _id: false,
      id: false,
    }],
    status: { type: Number, enum: Object.values(STATUSES), default: STATUSES.PENDING },
    domain: { type: String },
    estimatedTime: { type: Number },
    upvotes: { type: Number },
    downvotes: { type: Number },
    keywords: { type: [String] },
    featured: { type: Boolean },
    category: { type: ObjectId, ref: 'Category' },
  },
);

module.exports = ({ mongooseConnection }) => mongooseConnection.model('idea', Idea);

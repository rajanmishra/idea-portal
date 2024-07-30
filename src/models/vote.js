'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const { VOTES } = require('../constants');
const { buildScheme } = require('./buildScheme');

const Vote = buildScheme(
  {
    ideaId: { type: ObjectId, ref: 'Idea' },
    type: { type: Number, enum: Object.values(VOTES), default: VOTES.UPVOTE },
    description: { type: Boolean },

  },
);

module.exports = ({ mongooseConnection }) => mongooseConnection.model('vote', Vote);

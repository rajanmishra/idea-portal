'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const buildScheme = (modelSchema) => new Schema(
  {
    ...modelSchema,
    createdBy: { type: ObjectId, ref: 'Client' },
    updatedBy: { type: ObjectId, ref: 'Client' },
  },
  {
    timestamps: true,
  },
);

module.exports = { buildScheme };

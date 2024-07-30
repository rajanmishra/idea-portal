'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const Example = new Schema({
  name: { type: String },
  status: { type: Number },
  children: [{ type: ObjectId, ref: 'Example' }],
});

module.exports = ({ mongooseConnection }) => mongooseConnection.model('Example', Example);

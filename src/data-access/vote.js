'use strict';

const { VOTES } = require('../constants');

module.exports = class upvoteDataAccess {
  constructor({ upvoteModel }) {
    this.upvoteModel = upvoteModel;
  }

  // TODO:  assumption will get userId as key name
  async vote({ ideaId, userId: createdBy, type = VOTES.UPVOTE }) {
    const { upvoteModel } = this;
    const upvote = await upvoteModel.create({ ideaId, createdBy, type });
    if (upvote?._id) return { success: true, _id: upvote._id };
    return { success: false, _id: null };
  }

  async sponsor({
    ideaId, userId: createdBy, description, type = VOTES.SPONSOR,
  }) {
    const { upvoteModel } = this;
    return upvoteModel.create({
      ideaId, createdBy, type, description,
    });
  }
};

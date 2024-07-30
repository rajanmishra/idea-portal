'use strict';

module.exports = class commentDataAccess {
  constructor({ commentModel }) {
    this.commentModel = commentModel;
  }

  async getAllByIdeaId({ ideaId, status }) {
    const { commentModel } = this;
    return commentModel.find({ ideaId, status }).lean().exec();
  }

  async getAllByParentId({ parentId, status }) {
    const { commentModel } = this;
    return commentModel.find({ parentId, status }).lean().exec();
  }

  async getById({ _id }) {
    const { commentModel } = this;
    return commentModel.find({ _id }).lean().exec();
  }

  async create({ input }) {
    const { commentModel } = this;
    const comment = await commentModel.create({ input });
    if (comment?._id) return { _id: comment._id };
    return { _id: null };
  }

  async delete({ _id }) {
    const { commentModel } = this;
    const deleteComment = await commentModel.deleteOne({ _id });
    if (deleteComment.deletedCount) return { success: true, _id };
    return { success: false, _id: null };
  }
};

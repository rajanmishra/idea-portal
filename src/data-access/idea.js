'use strict';

const { STATUSES } = require('../constants');

module.exports = class IdeaDataAccess {
  constructor({ IdeaModel }) {
    this.IdeaModel = IdeaModel;
  }

  async getAll({ status }) {
    const { IdeaModel } = this;
    return IdeaModel.find({ status }).lean().exec();
  }

  async getAllByUserId({ status, createdBy }) {
    const { IdeaModel } = this;
    return IdeaModel.find({ createdBy, status }).lean().exec();
  }

  async getById({ _id }) {
    const { IdeaModel } = this;
    return IdeaModel.find({ _id }).lean().exec();
  }

  async create({ input }) {
    const { IdeaModel } = this;
    const idea = await IdeaModel.create(input);
    if (idea?._id) return { _id: idea._id };
    return { _id: null };
  }

  async update({ _id, input }) {
    const { IdeaModel } = this;
    return IdeaModel.findOneAndUpdate({ _id }, { $set: input }).lean().exec();
  }

  async updateStatus({ _id, status }) {
    const { IdeaModel } = this;
    return IdeaModel.findOneAndUpdate({ _id }, { $set: { status } }).lean().exec();
  }

  async inactive({ _id }) {
    const { IdeaModel } = this;
    return IdeaModel.findOneAndUpdate({ _id }, { $set: { status: STATUSES.INACTIVE } }).lean().exec();
  }

  async upvote({ _id }) {
    const { IdeaModel } = this;
    return IdeaModel.findOneAndUpdate({ _id }, { $inc: { upvotes: 1 } }).lean().exec();
  }

  async downvote({ _id }) {
    const { IdeaModel } = this;
    return IdeaModel.findOneAndUpdate({ _id }, { $inc: { downvotes: 1 } }).lean().exec();
  }

  async delete({ _id }) {
    const { IdeaModel } = this;
    const deleteIdea = await IdeaModel.deleteOne({ _id });
    if (deleteIdea.deletedCount) return { success: true, _id };
    return { success: false, _id: null };
  }
};

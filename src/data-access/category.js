'use strict';

module.exports = class categoryDataAccess {
  constructor({ categoryModel }) {
    this.categoryModel = categoryModel;
  }

  async getAll({ status }) {
    const { categoryModel } = this;
    return categoryModel.find({ status }).lean().exec();
  }

  async getAllByParentId({ parentId, status }) {
    const { categoryModel } = this;
    return categoryModel.find({ parentId, status }).lean().exec();
  }

  async getById({ _id }) {
    const { categoryModel } = this;
    return categoryModel.find({ _id }).lean().exec();
  }

  async create({ input }) {
    const { categoryModel } = this;
    const category = await categoryModel.create(input);
    if (category?._id) return { _id: category._id };
    return { _id: null };
  }

  async update({ _id, input }) {
    const { categoryModel } = this;
    return categoryModel.findOneAndUpdate({ _id }, { $set: input }).lean().exec();
  }

  async delete({ _id }) {
    const { categoryModel } = this;
    const deleteCategory = await categoryModel.deleteOne({ _id });
    if (deleteCategory.deletedCount) return { success: true, _id };
    return { success: false, _id: null };
  }
};

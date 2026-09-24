import mongoose from "mongoose";
import { collections } from "../config/storage.js";

export function createModelWrapper(modelName, mongooseSchema, collectionName) {
  let MongooseModel = null;
  try {
    MongooseModel = mongoose.model(modelName, mongooseSchema);
  } catch (e) {
    MongooseModel = mongoose.models[modelName];
  }

  const fallbackCol = collections[collectionName];

  return {
    async find(query = {}) {
      if (mongoose.connection.readyState === 1) {
        return await MongooseModel.find(query).lean();
      }
      return await fallbackCol.find(query);
    },

    async findOne(query = {}) {
      if (mongoose.connection.readyState === 1) {
        return await MongooseModel.findOne(query).lean();
      }
      return await fallbackCol.findOne(query);
    },

    async findById(id) {
      if (mongoose.connection.readyState === 1) {
        return await MongooseModel.findById(id).lean();
      }
      return await fallbackCol.findById(id);
    },

    async create(data) {
      if (mongoose.connection.readyState === 1) {
        const doc = new MongooseModel(data);
        const saved = await doc.save();
        return saved.toObject();
      }
      return await fallbackCol.create(data);
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (mongoose.connection.readyState === 1) {
        return await MongooseModel.findByIdAndUpdate(id, update, { new: true, ...options }).lean();
      }
      return await fallbackCol.findByIdAndUpdate(id, update, options);
    },

    async findByIdAndDelete(id) {
      if (mongoose.connection.readyState === 1) {
        return await MongooseModel.findByIdAndDelete(id).lean();
      }
      return await fallbackCol.findByIdAndDelete(id);
    },

    async countDocuments(query = {}) {
      if (mongoose.connection.readyState === 1) {
        return await MongooseModel.countDocuments(query);
      }
      return await fallbackCol.countDocuments(query);
    },

    async deleteMany(query = {}) {
      if (mongoose.connection.readyState === 1) {
        return await MongooseModel.deleteMany(query);
      }
      return await fallbackCol.deleteMany(query);
    }
  };
}

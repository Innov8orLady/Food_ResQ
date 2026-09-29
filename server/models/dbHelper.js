import mongoose from "mongoose";
import { collections } from "../config/storage.js";
import { connectDB } from "../config/db.js";

async function ensureConnected() {
  if (process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {}
  }
}

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
      await ensureConnected();
      if (mongoose.connection.readyState === 1) {
        try {
          const docs = await MongooseModel.find(query).lean();
          if (docs && docs.length > 0) return docs;
        } catch (e) {}
      }
      return await fallbackCol.find(query);
    },

    async findOne(query = {}) {
      await ensureConnected();
      if (mongoose.connection.readyState === 1) {
        try {
          const doc = await MongooseModel.findOne(query).lean();
          if (doc) return doc;
        } catch (e) {}
      }
      return await fallbackCol.findOne(query);
    },

    async findById(id) {
      await ensureConnected();
      if (mongoose.connection.readyState === 1) {
        try {
          const doc = await MongooseModel.findById(id).lean();
          if (doc) return doc;
        } catch (e) {
          // If id is not a standard MongoDB ObjectId (e.g. 12-byte hex from fallback), Mongoose throws CastError
        }
      }
      return await fallbackCol.findById(id);
    },

    async create(data) {
      await ensureConnected();
      if (mongoose.connection.readyState === 1) {
        try {
          const doc = new MongooseModel(data);
          const saved = await doc.save();
          const obj = saved.toObject();
          // Keep fallback store synchronized
          try { await fallbackCol.create(obj); } catch (e) {}
          return obj;
        } catch (err) {
          console.warn(`[dbHelper] Mongoose create error for ${modelName}:`, err.message);
        }
      }
      return await fallbackCol.create(data);
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      await ensureConnected();
      let res = null;
      if (mongoose.connection.readyState === 1) {
        try {
          res = await MongooseModel.findByIdAndUpdate(id, update, { new: true, ...options }).lean();
        } catch (e) {}
      }
      const fallbackRes = await fallbackCol.findByIdAndUpdate(id, update, options);
      return res || fallbackRes;
    },

    async findByIdAndDelete(id) {
      await ensureConnected();
      let res = null;
      if (mongoose.connection.readyState === 1) {
        try {
          res = await MongooseModel.findByIdAndDelete(id).lean();
        } catch (e) {}
      }
      const fallbackRes = await fallbackCol.findByIdAndDelete(id);
      return res || fallbackRes;
    },

    async countDocuments(query = {}) {
      await ensureConnected();
      if (mongoose.connection.readyState === 1) {
        try {
          const count = await MongooseModel.countDocuments(query);
          if (count > 0) return count;
        } catch (e) {}
      }
      return await fallbackCol.countDocuments(query);
    },

    async deleteMany(query = {}) {
      await ensureConnected();
      if (mongoose.connection.readyState === 1) {
        try {
          await MongooseModel.deleteMany(query);
        } catch (e) {}
      }
      return await fallbackCol.deleteMany(query);
    }
  };
}

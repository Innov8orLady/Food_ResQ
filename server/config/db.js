import mongoose from "mongoose";

let isMongoConnected = false;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return;
  }
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/foodresq";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB connected successfully.`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable (${error.message}).`);
    console.log(`[Database] FoodResQ resilient local document store activated for seamless zero-config execution.`);
  }
};

export const getDbStatus = () => {
  const connected = mongoose.connection.readyState === 1;
  return {
    isMongoConnected: connected,
    type: connected ? "MongoDB Atlas" : "LocalDocumentStore",
  };
};

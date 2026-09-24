import mongoose from "mongoose";

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/foodresq";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable at ${uri} (${error.message}).`);
    console.log(`[Database] FoodResQ resilient local document store activated for seamless zero-config execution.`);
  }
};

export const getDbStatus = () => ({
  isMongoConnected,
  type: isMongoConnected ? "MongoDB" : "LocalDocumentStore",
});

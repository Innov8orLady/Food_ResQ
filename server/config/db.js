import mongoose from "mongoose";

let isMongoConnected = false;
let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri && process.env.NODE_ENV === "production") {
    console.warn("[Database] No MONGODB_URI set; using local document store.");
    isMongoConnected = false;
    return null;
  }

  const targetUri = uri || "mongodb://127.0.0.1:27017/foodresq";

  connectionPromise = (async () => {
    try {
      mongoose.set("strictQuery", false);
      await mongoose.connect(targetUri, {
        dbName: "foodresq",
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10
      });
      isMongoConnected = true;
      console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
      return mongoose.connection;
    } catch (error) {
      isMongoConnected = false;
      console.warn(`[Database] MongoDB not reachable (${error.message}). FoodResQ resilient store active.`);
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const getDbStatus = () => {
  const connected = mongoose.connection.readyState === 1;
  return {
    isMongoConnected: connected,
    type: connected ? "MongoDB Atlas" : "LocalDocumentStore",
    databaseName: connected ? mongoose.connection.name : null,
    host: connected ? mongoose.connection.host : null,
  };
};

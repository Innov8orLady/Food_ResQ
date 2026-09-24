import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import { seedDatabase } from "./services/seedService.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import pickupRoutes from "./routes/pickupRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    platform: "FoodResQ - AI-Powered Food Rescue & Waste Intelligence",
    version: "1.0.0",
    aiModules: [
      "AI-Module-1: Food Recognition",
      "AI-Module-2: Food Safety / Risk Prediction",
      "AI-Module-3: Donor-Recipient Matching",
      "AI-Module-4: Demand & Waste Prediction",
      "AI-Module-5: Route Optimization"
    ],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let isInitialized = false;
async function initializeApp() {
  if (!isInitialized) {
    await connectDB();
    await seedDatabase();
    isInitialized = true;
  }
}

// Ensure database and seed store are ready on serverless calls
app.use(async (req, res, next) => {
  if (!isInitialized) {
    try {
      await initializeApp();
    } catch (err) {
      console.warn("DB init warning:", err.message);
    }
  }
  next();
});

// Start local listener only if not running inside Vercel serverless environment
if (!process.env.VERCEL) {
  initializeApp().then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`?? FoodResQ Backend API running on port ${PORT}`);
      console.log(`?? URL: http://localhost:${PORT}`);
      console.log(`?? AI Engine: Active (5 Modules Enabled)`);
      console.log(`====================================================`);
    });
  });
}

export default app;

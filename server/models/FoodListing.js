import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const FoodListingSchema = new mongoose.Schema({
  donorId: { type: String, required: true },
  donorName: { type: String, default: "" },
  donorOrg: { type: String, default: "" },
  donorPhone: { type: String, default: "" },
  foodName: { type: String, required: true },
  category: {
    type: String,
    enum: ["Cooked Meals", "Bakery & Bread", "Fresh Produce", "Dairy Products", "Packaged Foods", "Beverages"],
    default: "Cooked Meals"
  },
  quantity: { type: Number, required: true },
  unit: { type: String, default: "meals/packets" },
  image: { type: String, default: "" },
  preparationTime: { type: Date, default: Date.now },
  availableFrom: { type: Date, default: Date.now },
  availableUntil: { type: Date, required: true },
  location: {
    address: { type: String, default: "" },
    city: { type: String, default: "Delhi NCR" },
    coordinates: { type: [Number], default: [28.6139, 77.2090] } // [lat, lng]
  },
  storageCondition: {
    type: String,
    enum: ["Room Temperature", "Refrigerated", "Hot Holding (>60°C)", "Deep Freeze"],
    default: "Room Temperature"
  },
  packagingType: {
    type: String,
    enum: ["Sealed Food Containers", "Foil Wrapped", "Commercial Packaging", "Open Bulk Tray"],
    default: "Sealed Food Containers"
  },
  dietaryType: {
    type: String,
    enum: ["Vegetarian", "Non-Vegetarian", "Vegan"],
    default: "Vegetarian"
  },
  description: { type: String, default: "" },
  riskScore: { type: Number, default: 20 },
  riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "LOW" },
  urgency: { type: String, enum: ["NORMAL", "ELEVATED", "URGENT", "IMMEDIATE"], default: "NORMAL" },
  remainingSafeHours: { type: Number, default: 6 },
  aiRecognition: {
    detectedItem: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
    suggestedCategory: { type: String, default: "" },
    tags: { type: [String], default: [] },
    isDemo: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ["AVAILABLE", "CLAIMED", "PICKUP_SCHEDULED", "COMPLETED", "EXPIRED", "CANCELLED"],
    default: "AVAILABLE"
  },
  claimedBy: { type: String, default: null },
  claimedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const FoodListing = createModelWrapper("FoodListing", FoodListingSchema, "listings");

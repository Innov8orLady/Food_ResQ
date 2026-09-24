import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["donor", "recipient", "admin"], required: true },
  phone: { type: String, default: "" },
  organizationName: { type: String, default: "" },
  organizationType: { type: String, default: "Individual" },
  location: {
    address: { type: String, default: "" },
    city: { type: String, default: "Delhi NCR" },
    coordinates: { type: [Number], default: [28.6139, 77.2090] } // [lat, lng]
  },
  capacity: { type: Number, default: 50 }, // For recipients: meal handling capacity
  dietaryPreferences: { type: [String], default: ["Vegetarian", "Non-Vegetarian"] },
  verified: { type: Boolean, default: true },
  metrics: {
    donationsCount: { type: Number, default: 0 },
    claimsCount: { type: Number, default: 0 },
    mealsRescued: { type: Number, default: 0 },
    wastePreventedKg: { type: Number, default: 0 },
    co2OffsetKg: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = createModelWrapper("User", UserSchema, "users");

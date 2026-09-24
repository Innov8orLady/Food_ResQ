import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const PickupSchema = new mongoose.Schema({
  claimId: { type: String, required: true },
  listingId: { type: String, default: "" },
  donorId: { type: String, required: true },
  recipientId: { type: String, required: true },
  status: {
    type: String,
    enum: ["SCHEDULED", "IN_TRANSIT", "COMPLETED", "CANCELLED"],
    default: "SCHEDULED"
  },
  scheduledTime: { type: Date, default: Date.now },
  route: {
    stops: { type: Array, default: [] },
    totalDistanceKm: { type: Number, default: 0 },
    totalDurationMin: { type: Number, default: 0 },
    priorityOrder: { type: Array, default: [] }
  },
  pickupNotes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export const Pickup = createModelWrapper("Pickup", PickupSchema, "pickups");

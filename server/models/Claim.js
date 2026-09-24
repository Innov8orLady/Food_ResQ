import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const ClaimSchema = new mongoose.Schema({
  listingId: { type: String, required: true },
  donorId: { type: String, required: true },
  recipientId: { type: String, required: true },
  recipientName: { type: String, default: "" },
  recipientOrg: { type: String, default: "" },
  recipientPhone: { type: String, default: "" },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "PICKUP_SCHEDULED", "COMPLETED", "CANCELLED"],
    default: "CONFIRMED"
  },
  pickupTime: { type: Date, default: null },
  pickupNotes: { type: String, default: "" },
  claimedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const Claim = createModelWrapper("Claim", ClaimSchema, "claims");

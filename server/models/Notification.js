import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["claim", "confirmation", "pickup", "expiry", "system", "match"],
    default: "system"
  },
  link: { type: String, default: "" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = createModelWrapper("Notification", NotificationSchema, "notifications");

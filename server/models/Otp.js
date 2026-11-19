import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const OtpSchema = new mongoose.Schema({
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  otp: { type: String, required: true },
  channel: { type: String, enum: ["email", "sms"], default: "email" },
  purpose: { type: String, default: "registration" }, // registration | password_reset | login
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Otp = createModelWrapper("Otp", OtpSchema, "otps");

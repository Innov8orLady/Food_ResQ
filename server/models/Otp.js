import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, default: "registration" }, // registration | password_reset | login
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Otp = createModelWrapper("Otp", OtpSchema, "otps");

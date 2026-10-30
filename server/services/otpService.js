import crypto from "crypto";
import nodemailer from "nodemailer";
import { Otp } from "../models/Otp.js";

/**
 * Configure Nodemailer transporter if environment variables exist
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass }
    });
  }

  // Gmail shorthand if provided
  if (user && pass && user.includes("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Send an OTP code to a user's email
 */
export async function sendOtpEmail({ email, name = "Food Hero", purpose = "registration" }) {
  const cleanEmail = email.trim().toLowerCase();
  
  // Generate random 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete previous pending OTPs for this email & purpose
  try {
    await Otp.deleteMany({ email: cleanEmail, purpose });
  } catch (e) {
    console.warn("[OTP] Cleanup warning:", e.message);
  }

  // Save new OTP
  await Otp.create({
    email: cleanEmail,
    otp: code,
    purpose,
    expiresAt
  });

  console.log(`[OTP Engine] Generated code [${code}] for ${cleanEmail} (${purpose}). Valid for 10 minutes.`);

  // Attempt live email delivery if credentials configured
  let emailSent = false;
  const transporter = createTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"FoodResQ Security" <${process.env.EMAIL_USER || "noreply@foodresq.org"}>`,
        to: cleanEmail,
        subject: `Your FoodResQ Verification Code: ${code}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #059669; color: #ffffff; border-radius: 12px; font-size: 24px; font-weight: bold;">🌱</div>
              <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 22px;">Verify Your FoodResQ Account</h2>
              <p style="color: #64748b; font-size: 13px; margin: 0;">AI-Powered Food Rescue & Waste Intelligence Network</p>
            </div>
            
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Please use the following 6-digit verification code to complete your ${purpose === "registration" ? "account registration" : "verification"}:</p>
            
            <div style="margin: 28px 0; text-align: center;">
              <span style="display: inline-block; background: #f0fdf4; border: 2px dashed #059669; color: #047857; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; border-radius: 12px;">
                ${code}
              </span>
            </div>
            
            <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
              This code will expire in <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} FoodResQ Platform • Fighting Hunger & Food Waste with AI
            </p>
          </div>
        `
      });
      console.log(`[OTP Engine] Live email sent to ${cleanEmail}: ${info.messageId}`);
      emailSent = true;
    } catch (err) {
      console.warn(`[OTP Engine] Live email transport error (${err.message}). Falling back to visual preview.`);
    }
  }

  return {
    success: true,
    message: emailSent
      ? `Verification code sent to ${cleanEmail}. Please check your inbox.`
      : `Verification code generated for ${cleanEmail}.`,
    emailSent,
    // Return preview code so users without SMTP credentials configured can test instantly
    previewOtp: code,
    expiresAt
  };
}

/**
 * Verify an OTP code provided by the user
 */
export async function verifyOtp({ email, otp, purpose = "registration" }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = String(otp || "").trim();

  if (!cleanOtp || cleanOtp.length !== 6) {
    return { success: false, message: "Please provide a valid 6-digit verification code." };
  }

  // Find recent OTP for this email
  const records = await Otp.find({ email: cleanEmail, purpose });
  if (!records || records.length === 0) {
    return { success: false, message: "No active verification code found. Please request a new one." };
  }

  // Get most recent record
  records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestOtp = records[0];

  // Check expiration
  if (new Date(latestOtp.expiresAt) < new Date()) {
    try { await Otp.deleteMany({ email: cleanEmail, purpose }); } catch (e) {}
    return { success: false, message: "Verification code has expired. Please request a new code." };
  }

  // Check match
  if (latestOtp.otp !== cleanOtp) {
    return { success: false, message: "Incorrect verification code. Please check and try again." };
  }

  // Delete validated OTP so it cannot be reused
  try {
    await Otp.deleteMany({ email: cleanEmail, purpose });
  } catch (e) {}

  return { success: true, message: "Code verified successfully." };
}

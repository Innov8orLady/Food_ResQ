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
  const port = Number(process.env.SMTP_PORT) || 587;

  // Custom SMTP (e.g. Brevo, SendGrid, Mailgun, Amazon SES, or custom domain)
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465 || process.env.SMTP_SECURE === "true",
      auth: { user, pass }
    });
  }

  // Gmail SMTP with App Password (most common & easiest)
  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Send real OTP via Email
 */
export async function sendOtpEmail({ email, phone = "", name = "Food Hero", purpose = "registration" }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: "A valid email address is required to send verification code." };
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.error("[OTP Engine] No email service credentials configured in environment.");
    return {
      success: false,
      message: "Email delivery service not configured on server. Please add EMAIL_USER and EMAIL_PASS (Gmail App Password) in your Vercel Environment Variables to send real emails."
    };
  }

  // Generate random 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete previous pending OTPs for this email & purpose
  try {
    await Otp.deleteMany({ email: cleanEmail, purpose });
  } catch (e) {
    console.warn("[OTP] Cleanup warning:", e.message);
  }

  // Save new OTP in database
  await Otp.create({
    email: cleanEmail,
    phone: phone ? phone.trim() : "",
    otp: code,
    channel: "email",
    purpose,
    expiresAt
  });

  const senderAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@foodresq.org";

  try {
    const info = await transporter.sendMail({
      from: `"FoodResQ" <${senderAddress}>`,
      to: cleanEmail,
      subject: `Your FoodResQ Verification Code: ${code}`,
      text: `Your FoodResQ verification code is: ${code}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; background: #059669; color: #ffffff; border-radius: 14px; font-size: 26px; font-weight: bold;">🌱</div>
            <h2 style="color: #0f172a; margin: 14px 0 4px 0; font-size: 22px; font-weight: 800;">FoodResQ Verification</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">AI-Powered Food Rescue & Waste Intelligence</p>
          </div>
          
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">Here is your 6-digit real verification code for FoodResQ:</p>
          
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background: #f0fdf4; border: 2px dashed #059669; color: #047857; font-size: 34px; font-weight: 800; letter-spacing: 10px; padding: 16px 28px; border-radius: 14px;">
              ${code}
            </div>
          </div>
          
          <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
            This verification code is strictly valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} FoodResQ Platform • Fighting Hunger & Food Waste with AI
          </p>
        </div>
      `
    });

    console.log(`[OTP Engine] Real email delivered to ${cleanEmail}: ${info.messageId}`);
    return {
      success: true,
      channel: "email",
      message: `A real verification code has been sent to ${cleanEmail}. Please check your inbox or spam folder.`,
      expiresAt
    };
  } catch (err) {
    console.error(`[OTP Engine] Live email delivery failed:`, err.message);
    return {
      success: false,
      message: `Failed to deliver email: ${err.message}. Please verify your server email credentials.`
    };
  }
}

/**
 * Send real OTP via Phone (SMS)
 */
export async function sendOtpSms({ phone, email = "", name = "Food Hero", purpose = "registration" }) {
  const cleanPhone = (phone || "").trim().replace(/\s+/g, "");
  if (!cleanPhone || cleanPhone.length < 8) {
    return { success: false, message: "A valid mobile phone number is required to send SMS." };
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;

  if (!twilioSid && !fast2SmsKey) {
    console.error("[OTP Engine] No SMS service credentials (Twilio or Fast2SMS) configured in environment.");
    return {
      success: false,
      message: "SMS gateway not configured on server. Please use Email verification, or add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your Vercel Environment Variables."
    };
  }

  // Generate random 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete previous pending OTPs for this phone & purpose
  try {
    await Otp.deleteMany({ phone: cleanPhone, purpose });
  } catch (e) {
    console.warn("[OTP] Cleanup warning:", e.message);
  }

  // Save new OTP in database
  await Otp.create({
    email: email ? email.trim().toLowerCase() : "",
    phone: cleanPhone,
    otp: code,
    channel: "sms",
    purpose,
    expiresAt
  });

  const smsText = `Your FoodResQ verification code is: ${code}. Valid for 10 minutes. Do not share.`;

  // Send via Twilio if configured
  if (twilioSid && twilioAuth && twilioPhone) {
    try {
      const authHeader = "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
      const bodyParams = new URLSearchParams();
      bodyParams.append("To", cleanPhone.startsWith("+") ? cleanPhone : `+91${cleanPhone}`);
      bodyParams.append("From", twilioPhone);
      bodyParams.append("Body", smsText);

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyParams.toString()
      });

      const data = await twilioRes.json();
      if (!twilioRes.ok) {
        throw new Error(data.message || "Twilio API rejected the request.");
      }

      console.log(`[OTP Engine] Real SMS delivered to ${cleanPhone}: ${data.sid}`);
      return {
        success: true,
        channel: "sms",
        message: `A real verification code has been sent via SMS to ${cleanPhone}.`,
        expiresAt
      };
    } catch (err) {
      console.error(`[OTP Engine] Twilio SMS failed:`, err.message);
      return {
        success: false,
        message: `Failed to deliver SMS: ${err.message}. Please use Email verification instead.`
      };
    }
  }

  // Send via Fast2SMS if configured (India)
  if (fast2SmsKey) {
    try {
      const fastRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": fast2SmsKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: code,
          numbers: cleanPhone.replace(/^\+91/, "")
        })
      });

      const fastData = await fastRes.json();
      if (!fastData.return) {
        throw new Error(fastData.message || "Fast2SMS rejected the request.");
      }

      console.log(`[OTP Engine] Real Fast2SMS delivered to ${cleanPhone}`);
      return {
        success: true,
        channel: "sms",
        message: `A real verification code has been sent via SMS to ${cleanPhone}.`,
        expiresAt
      };
    } catch (err) {
      console.error(`[OTP Engine] Fast2SMS failed:`, err.message);
      return {
        success: false,
        message: `Failed to deliver SMS: ${err.message}. Please use Email verification instead.`
      };
    }
  }

  return {
    success: false,
    message: "SMS gateway is unavailable."
  };
}

/**
 * Dispatch OTP via requested channel (email or sms)
 */
export async function sendOtp({ email = "", phone = "", channel = "email", name = "Food Hero", purpose = "registration" }) {
  if (channel === "sms" && phone) {
    return await sendOtpSms({ phone, email, name, purpose });
  }
  return await sendOtpEmail({ email, phone, name, purpose });
}

/**
 * Verify an OTP code provided by the user (by email or phone)
 */
export async function verifyOtp({ email = "", phone = "", otp, purpose = "registration" }) {
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  const cleanPhone = phone ? phone.trim().replace(/\s+/g, "") : "";
  const cleanOtp = String(otp || "").trim();

  if (!cleanOtp || cleanOtp.length !== 6) {
    return { success: false, message: "Please provide a valid 6-digit verification code." };
  }

  // Build query: match either email or phone
  const query = { purpose };
  if (cleanEmail) query.email = cleanEmail;
  else if (cleanPhone) query.phone = cleanPhone;
  else {
    return { success: false, message: "Email or phone number is required to verify code." };
  }

  // Find recent OTP for this recipient
  const records = await Otp.find(query);
  if (!records || records.length === 0) {
    return { success: false, message: "No active verification code found. Please request a new code." };
  }

  // Get most recent record
  records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestOtp = records[0];

  // Check expiration
  if (new Date(latestOtp.expiresAt) < new Date()) {
    try { await Otp.deleteMany(query); } catch (e) {}
    return { success: false, message: "Verification code has expired. Please request a new code." };
  }

  // Check match
  if (latestOtp.otp !== cleanOtp) {
    return { success: false, message: "Incorrect verification code. Please check your inbox/messages and try again." };
  }

  // Delete validated OTP so it cannot be reused
  try {
    await Otp.deleteMany(query);
  } catch (e) {}

  return { success: true, message: "Code verified successfully." };
}

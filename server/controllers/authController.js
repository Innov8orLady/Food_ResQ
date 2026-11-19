import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { SystemConfig } from "../models/SystemConfig.js";
import { sendOtp, verifyOtp, getGatewayCredentials } from "../services/otpService.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "foodresq_jwt_secret_key_super_secure_2026", {
    expiresIn: "30d"
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organizationName, organizationType, address, city, coordinates, capacity, dietaryPreferences, otp } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Please provide all required registration fields." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: "Email and password cannot be blank." });
    }

    if (otp) {
      const otpRes = await verifyOtp({
        email: cleanEmail,
        phone: phone ? phone.trim() : "",
        otp,
        purpose: "registration"
      });
      if (!otpRes.success) {
        return res.status(400).json({ success: false, message: otpRes.message });
      }
    }

    const normalizedRole = role.toLowerCase().trim();
    const allowedRegistrationRoles = ["donor", "recipient"];
    if (!allowedRegistrationRoles.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Administrator accounts cannot be self-registered. Only 'donor' and 'recipient' registrations are permitted."
      });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email address already exists. Please sign in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: normalizedRole,
      phone: phone ? phone.trim() : "",
      organizationName: organizationName ? organizationName.trim() : name.trim(),
      organizationType: organizationType || (normalizedRole === "donor" ? "Restaurant" : "NGO"),
      location: {
        address: address ? address.trim() : "",
        city: city ? city.trim() : "Delhi NCR",
        coordinates: coordinates || [28.6139, 77.2090]
      },
      capacity: capacity ? Number(capacity) : 50,
      dietaryPreferences: dietaryPreferences || ["Vegetarian", "Non-Vegetarian"],
      verified: true
    });

    const token = generateToken(user._id || user.id, user.role);

    const { password: _, ...safeUser } = user;
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter your email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = (await bcrypt.compare(cleanPassword, user.password)) || (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      console.warn(`[Auth] Password mismatch for ${cleanEmail}`);
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id || user.id, user.role);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
};

export const quickDemoLogin = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Security Policy: Quick demo bypass is disabled for Platform Administrator accounts. Please log in via the Secure Admin Gateway."
      });
    }

    let targetEmail = "donor@foodresq.org";
    if (role === "recipient") targetEmail = "recipient@foodresq.org";

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role '${role}' not found. Please re-seed.` });
    }

    const token = generateToken(user._id, user.role);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: `Logged in as Demo ${user.role.toUpperCase()}`,
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password, securityCode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter your administrator email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Optional admin security code / passkey verification (if configured in environment)
    const configuredCode = process.env.ADMIN_SECURITY_CODE;
    if (configuredCode && securityCode !== configuredCode) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid Administrator Security Clearance Code."
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid credentials or account lacks administrator privileges."
      });
    }

    const isMatch = (await bcrypt.compare(cleanPassword, user.password)) || (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid administrator password."
      });
    }

    const token = generateToken(user._id || user.id, user.role);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: "Admin authentication successful. Welcome to FoodResQ Command Center.",
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = newPassword.trim();

    if (cleanPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: `No account found with email '${cleanEmail}'.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    await User.findByIdAndUpdate(user._id || user.id, { password: hashedPassword });

    res.json({
      success: true,
      message: `Password for ${cleanEmail} updated successfully. You can now sign in.`
    });
  } catch (error) {
    next(error);
  }
};

export const requestOtp = async (req, res, next) => {
  try {
    const { email, phone, channel = "email", name, purpose = "registration" } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: "Email or phone number is required to send verification code." });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPhone = phone ? phone.trim() : "";

    if (purpose === "registration" && cleanEmail) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: "An account with this email address already exists. Please sign in." });
      }
    }

    const result = await sendOtp({ email: cleanEmail, phone: cleanPhone, channel, name: name || "Food Hero", purpose });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtpCode = async (req, res, next) => {
  try {
    const { email, phone, otp, purpose = "registration" } = req.body;
    if ((!email && !phone) || !otp) {
      return res.status(400).json({ success: false, message: "Email/Phone and verification code are required." });
    }
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPhone = phone ? phone.trim() : "";
    const result = await verifyOtp({ email: cleanEmail, phone: cleanPhone, otp, purpose });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getGatewayStatus = async (req, res, next) => {
  try {
    const creds = await getGatewayCredentials();
    const configuredProviders = [
      creds.resendKey ? "Resend API" : null,
      creds.brevoKey ? "Brevo API" : null,
      creds.sendgridKey ? "SendGrid API" : null,
      (creds.user && creds.pass) ? `Gmail (${creds.user})` : null,
      creds.twilioSid ? "Twilio SMS" : null,
      creds.fast2SmsKey ? "Fast2SMS" : null
    ].filter(Boolean);

    res.json({
      success: true,
      hasEmailGateway: Boolean(creds.resendKey || creds.brevoKey || creds.sendgridKey || (creds.user && creds.pass)),
      hasSmsGateway: Boolean((creds.twilioSid && creds.twilioAuth && creds.twilioPhone) || creds.fast2SmsKey),
      configuredProviders
    });
  } catch (error) {
    next(error);
  }
};

export const saveGatewayCredentials = async (req, res, next) => {
  try {
    const {
      EMAIL_USER,
      EMAIL_PASS,
      RESEND_API_KEY,
      BREVO_API_KEY,
      SENDGRID_API_KEY,
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER,
      FAST2SMS_API_KEY
    } = req.body;

    const existing = await SystemConfig.findOne({ key: "gateway_credentials" });
    const currentValue = (existing && existing.value) || {};

    const updatedValue = {
      ...currentValue,
      ...(EMAIL_USER !== undefined && { EMAIL_USER: String(EMAIL_USER).trim() }),
      ...(EMAIL_PASS !== undefined && { EMAIL_PASS: String(EMAIL_PASS).trim().replace(/\s+/g, '') }),
      ...(RESEND_API_KEY !== undefined && { RESEND_API_KEY: String(RESEND_API_KEY).trim() }),
      ...(BREVO_API_KEY !== undefined && { BREVO_API_KEY: String(BREVO_API_KEY).trim() }),
      ...(SENDGRID_API_KEY !== undefined && { SENDGRID_API_KEY: String(SENDGRID_API_KEY).trim() }),
      ...(TWILIO_ACCOUNT_SID !== undefined && { TWILIO_ACCOUNT_SID: String(TWILIO_ACCOUNT_SID).trim() }),
      ...(TWILIO_AUTH_TOKEN !== undefined && { TWILIO_AUTH_TOKEN: String(TWILIO_AUTH_TOKEN).trim() }),
      ...(TWILIO_PHONE_NUMBER !== undefined && { TWILIO_PHONE_NUMBER: String(TWILIO_PHONE_NUMBER).trim() }),
      ...(FAST2SMS_API_KEY !== undefined && { FAST2SMS_API_KEY: String(FAST2SMS_API_KEY).trim() })
    };

    await SystemConfig.findOneAndUpdate(
      { key: "gateway_credentials" },
      { key: "gateway_credentials", value: updatedValue },
      { upsert: true, new: true }
    );

    const configuredProviders = [
      updatedValue.RESEND_API_KEY ? "Resend API" : null,
      updatedValue.BREVO_API_KEY ? "Brevo API" : null,
      updatedValue.SENDGRID_API_KEY ? "SendGrid API" : null,
      (updatedValue.EMAIL_USER && updatedValue.EMAIL_PASS) ? `Gmail (${updatedValue.EMAIL_USER})` : null,
      updatedValue.TWILIO_ACCOUNT_SID ? "Twilio SMS" : null,
      updatedValue.FAST2SMS_API_KEY ? "Fast2SMS" : null
    ].filter(Boolean);

    res.json({
      success: true,
      message: "Gateway credentials saved successfully in database.",
      configuredProviders
    });
  } catch (error) {
    next(error);
  }
};



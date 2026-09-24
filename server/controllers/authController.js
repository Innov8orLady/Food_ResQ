import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "foodresq_jwt_secret_key_super_secure_2026", {
    expiresIn: "30d"
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organizationName, organizationType, address, city, coordinates, capacity, dietaryPreferences } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Please provide all required registration fields." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: "Email and password cannot be blank." });
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

    const token = generateToken(user._id, user.role);

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

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id, user.role);
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

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid administrator password."
      });
    }

    const token = generateToken(user._id, user.role);
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

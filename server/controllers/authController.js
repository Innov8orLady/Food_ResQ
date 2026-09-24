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

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email address already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase(),
      phone: phone || "",
      organizationName: organizationName || name,
      organizationType: organizationType || (role === "donor" ? "Restaurant" : "NGO"),
      location: {
        address: address || "",
        city: city || "Delhi NCR",
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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
    let targetEmail = "donor@foodresq.org";
    if (role === "recipient") targetEmail = "recipient@foodresq.org";
    if (role === "admin") targetEmail = "admin@foodresq.org";

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

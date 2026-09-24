import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, phone, organizationName, organizationType, location, capacity, dietaryPreferences } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (organizationName) updates.organizationName = organizationName;
    if (organizationType) updates.organizationType = organizationType;
    if (location) updates.location = location;
    if (capacity) updates.capacity = Number(capacity);
    if (dietaryPreferences) updates.dietaryPreferences = dietaryPreferences;

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true });
    const { password: _, ...safeUser } = updated;
    res.json({ success: true, message: "Profile updated successfully", user: safeUser });
  } catch (error) {
    next(error);
  }
};

export const toggleUserVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const updated = await User.findByIdAndUpdate(id, { verified: !user.verified }, { new: true });
    res.json({ success: true, message: `User verification updated to ${updated.verified}`, user: updated });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ userId });
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

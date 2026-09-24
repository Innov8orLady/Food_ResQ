import express from "express";
import {
  getAllUsers,
  updateUserProfile,
  toggleUserVerification,
  getNotifications,
  markNotificationRead,
  changePassword
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllUsers);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.put("/:id/verify", protect, authorize("admin"), toggleUserVerification);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);

export default router;

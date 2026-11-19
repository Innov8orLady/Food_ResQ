import express from "express";
import {
  register,
  login,
  getMe,
  quickDemoLogin,
  adminLogin,
  resetPassword,
  requestOtp,
  verifyOtpCode,
  getGatewayStatus,
  saveGatewayCredentials
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/send-otp", requestOtp);
router.post("/verify-otp", verifyOtpCode);
router.get("/gateway-status", getGatewayStatus);
router.post("/save-gateway-credentials", saveGatewayCredentials);

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/admin-login", adminLogin);
router.get("/me", protect, getMe);
router.post("/demo-login", quickDemoLogin);

export default router;

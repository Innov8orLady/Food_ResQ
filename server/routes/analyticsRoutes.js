import express from "express";
import {
  getDonorAnalytics,
  getRecipientAnalytics,
  getAdminAnalytics
} from "../controllers/analyticsController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/donor", protect, authorize("donor", "admin"), getDonorAnalytics);
router.get("/recipient", protect, authorize("recipient", "admin"), getRecipientAnalytics);
router.get("/admin", protect, authorize("admin"), getAdminAnalytics);

export default router;

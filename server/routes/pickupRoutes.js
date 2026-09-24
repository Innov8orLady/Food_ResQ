import express from "express";
import { getPickups, planOptimalRoute } from "../controllers/pickupController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getPickups);
router.post("/plan-route", protect, planOptimalRoute);

export default router;

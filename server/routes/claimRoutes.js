import express from "express";
import {
  createClaim,
  getMyClaims,
  getDonorClaims,
  updateClaimStatus,
  getAllClaims
} from "../controllers/claimController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("recipient", "admin"), createClaim);
router.get("/my", protect, authorize("recipient", "admin"), getMyClaims);
router.get("/donor", protect, authorize("donor", "admin"), getDonorClaims);
router.get("/all", protect, authorize("admin"), getAllClaims);
router.put("/:id", protect, updateClaimStatus);

export default router;

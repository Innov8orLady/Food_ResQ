import express from "express";
import {
  handleFoodRecognition,
  handleRiskPrediction,
  handleRecipientMatching,
  handleDemandPrediction,
  handleRouteOptimization
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/food-recognition", handleFoodRecognition);
router.post("/risk-prediction", handleRiskPrediction);
router.post("/matching", handleRecipientMatching);
router.post("/demand-prediction", handleDemandPrediction);
router.post("/route-optimization", handleRouteOptimization);

export default router;

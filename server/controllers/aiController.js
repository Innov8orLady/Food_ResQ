import {
  recognizeFood,
  predictRisk,
  matchRecipients,
  predictDemandAndWaste,
  optimizePickupRoute
} from "../services/aiLocalService.js";
import { User } from "../models/User.js";
import { FoodListing } from "../models/FoodListing.js";

// AI Module 1: Food Recognition
export const handleFoodRecognition = async (req, res, next) => {
  try {
    const { imageName, filename, textHint } = req.body;
    const result = await recognizeFood({ imageName, filename, textHint });
    res.json({ success: true, module: "AI-Module-1-Food-Recognition", result });
  } catch (error) {
    next(error);
  }
};

// AI Module 2: Food Safety / Risk Prediction
export const handleRiskPrediction = async (req, res, next) => {
  try {
    const {
      foodName,
      category,
      preparationTime,
      storageCondition,
      packagingType,
      dietaryType
    } = req.body;

    const result = await predictRisk({
      foodName,
      category,
      preparationTime,
      storageCondition,
      packagingType,
      dietaryType
    });

    res.json({ success: true, module: "AI-Module-2-Food-Safety-Risk", result });
  } catch (error) {
    next(error);
  }
};

// AI Module 3: Donor-Recipient Intelligent Matching
export const handleRecipientMatching = async (req, res, next) => {
  try {
    const { listingId, listingData, weights } = req.body;

    let listing = listingData;
    if (listingId && !listing) {
      listing = await FoodListing.findById(listingId);
    }

    if (!listing) {
      return res.status(400).json({ success: false, message: "Listing details are required for matching." });
    }

    // Fetch all active recipient organizations
    const recipients = await User.find({ role: "recipient" });

    const result = await matchRecipients({ listing, recipients, weights });
    res.json({ success: true, module: "AI-Module-3-Smart-Matching", result });
  } catch (error) {
    next(error);
  }
};

// AI Module 4: Demand & Waste Prediction
export const handleDemandPrediction = async (req, res, next) => {
  try {
    const { city } = req.body;
    const historicalListings = await FoodListing.find();
    const result = await predictDemandAndWaste({
      city: city || "Delhi NCR",
      historicalListings
    });
    res.json({ success: true, module: "AI-Module-4-Demand-Waste-Prediction", result });
  } catch (error) {
    next(error);
  }
};

// AI Module 5: Pickup Route Optimization
export const handleRouteOptimization = async (req, res, next) => {
  try {
    const { origin, stops } = req.body;

    let routeOrigin = origin;
    if (!routeOrigin && req.user) {
      routeOrigin = {
        name: req.user.organizationName || req.user.name,
        coordinates: req.user.location?.coordinates || [28.6320, 77.2180]
      };
    }

    const result = await optimizePickupRoute({
      origin: routeOrigin || { name: "Central Hub", coordinates: [28.6320, 77.2180] },
      stops: stops || []
    });

    res.json({ success: true, module: "AI-Module-5-Route-Optimizer", result });
  } catch (error) {
    next(error);
  }
};

import { FoodListing } from "../models/FoodListing.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { predictRisk, recognizeFood } from "../services/aiLocalService.js";
import { calculateDistance } from "../utils/geoUtils.js";

export const createListing = async (req, res, next) => {
  try {
    const {
      foodName,
      category,
      quantity,
      unit,
      image,
      preparationTime,
      availableFrom,
      availableUntil,
      storageCondition,
      packagingType,
      dietaryType,
      description,
      address,
      city,
      coordinates
    } = req.body;

    if (!foodName || !quantity || !availableUntil) {
      return res.status(400).json({
        success: false,
        message: "Please provide food name, quantity, and expiration time."
      });
    }

    const donor = req.user;

    // AI Risk Prediction
    const riskAnalysis = await predictRisk({
      foodName,
      category: category || "Cooked Meals",
      preparationTime: preparationTime || new Date(),
      storageCondition: storageCondition || "Room Temperature",
      packagingType: packagingType || "Sealed Food Containers",
      dietaryType: dietaryType || "Vegetarian"
    });

    // AI Food Recognition Tags
    const aiRecognized = await recognizeFood({
      imageName: image || "",
      filename: image || "",
      textHint: foodName
    });

    const listingLocation = {
      address: address || donor.location?.address || "Civil Lines, Delhi",
      city: city || donor.location?.city || "Delhi NCR",
      coordinates: coordinates || donor.location?.coordinates || [28.6139, 77.2090]
    };

    const listing = await FoodListing.create({
      donorId: donor._id || donor.id,
      donorName: donor.name,
      donorOrg: donor.organizationName || donor.name,
      donorPhone: donor.phone || "",
      foodName,
      category: category || "Cooked Meals",
      quantity: Number(quantity),
      unit: unit || "meals/packets",
      image: image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60",
      preparationTime: preparationTime || new Date(),
      availableFrom: availableFrom || new Date(),
      availableUntil,
      location: listingLocation,
      storageCondition: storageCondition || "Room Temperature",
      packagingType: packagingType || "Sealed Food Containers",
      dietaryType: dietaryType || "Vegetarian",
      description: description || "",
      riskScore: riskAnalysis.riskScore,
      riskLevel: riskAnalysis.riskLevel,
      urgency: riskAnalysis.urgency,
      remainingSafeHours: riskAnalysis.remainingSafeHours,
      aiRecognition: aiRecognized,
      status: "AVAILABLE"
    });

    // Update donor statistics
    const currentCount = donor.metrics?.donationsCount || 0;
    await User.findByIdAndUpdate(donor._id || donor.id, {
      "metrics.donationsCount": currentCount + 1
    });

    // If High/Critical Urgency, notify nearby recipients
    if (riskAnalysis.urgency === "URGENT" || riskAnalysis.urgency === "IMMEDIATE") {
      const allRecipients = await User.find({ role: "recipient" });
      for (const rec of allRecipients) {
        await Notification.create({
          userId: rec._id || rec.id,
          title: `Urgent Food Rescue Alert: ${foodName}`,
          message: `${quantity} ${unit || "meals"} at ${donor.organizationName} needs rapid collection within ${riskAnalysis.remainingSafeHours} hours.`,
          type: "expiry",
          link: `/recipient/food/${listing._id}`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Surplus food listed successfully with AI Risk Profile generated.",
      listing
    });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const { category, dietaryType, status, urgency, donorId } = req.query;
    let filter = {};

    if (category && category !== "All") filter.category = category;
    if (dietaryType && dietaryType !== "All") filter.dietaryType = dietaryType;
    if (status && status !== "All") filter.status = status;
    if (urgency && urgency !== "All") filter.urgency = urgency;
    if (donorId) filter.donorId = donorId;

    const listings = await FoodListing.find(filter);
    res.json({ success: true, count: listings.length, listings });
  } catch (error) {
    next(error);
  }
};

export const getNearbyFood = async (req, res, next) => {
  try {
    const userLat = Number(req.query.lat) || (req.user?.location?.coordinates?.[0]) || 28.6320;
    const userLng = Number(req.query.lng) || (req.user?.location?.coordinates?.[1]) || 77.2180;
    const maxDist = Number(req.query.maxDistance) || 50; // km
    const { category, dietaryType, urgency } = req.query;

    const userCoord = [userLat, userLng];
    const available = await FoodListing.find({ status: "AVAILABLE" });

    let results = available.map(item => {
      const itemCoord = item.location?.coordinates || [28.6139, 77.2090];
      const dist = calculateDistance(userCoord, itemCoord);
      return {
        ...item,
        distanceKm: dist
      };
    });

    // Filter by max distance
    results = results.filter(item => item.distanceKm <= maxDist);

    // Apply additional filters
    if (category && category !== "All") {
      results = results.filter(i => i.category === category);
    }
    if (dietaryType && dietaryType !== "All") {
      results = results.filter(i => i.dietaryType === dietaryType);
    }
    if (urgency && urgency !== "All") {
      results = results.filter(i => i.urgency === urgency);
    }

    // Sort: Urgent items first, then nearest distance
    results.sort((a, b) => {
      const urgencyRank = { IMMEDIATE: 4, URGENT: 3, ELEVATED: 2, NORMAL: 1 };
      const rankDiff = (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0);
      if (rankDiff !== 0) return rankDiff;
      return a.distanceKm - b.distanceKm;
    });

    res.json({
      success: true,
      userLocation: { lat: userLat, lng: userLng },
      count: results.length,
      listings: results
    });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Food listing not found" });
    }

    // Include donor contact info
    const donor = await User.findById(listing.donorId);

    res.json({
      success: true,
      listing: {
        ...listing,
        donor: donor ? {
          name: donor.name,
          organizationName: donor.organizationName,
          phone: donor.phone,
          location: donor.location,
          verified: donor.verified
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Ensure only the donor or admin can edit
    if (req.user.role !== "admin" && String(listing.donorId) !== String(req.user._id || req.user.id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this listing" });
    }

    // If storage condition or prep time changed, recalculate risk
    let updatedRisk = null;
    if (req.body.storageCondition || req.body.preparationTime) {
      updatedRisk = await predictRisk({
        foodName: req.body.foodName || listing.foodName,
        category: req.body.category || listing.category,
        preparationTime: req.body.preparationTime || listing.preparationTime,
        storageCondition: req.body.storageCondition || listing.storageCondition,
        packagingType: req.body.packagingType || listing.packagingType,
        dietaryType: req.body.dietaryType || listing.dietaryType
      });
    }

    const updates = {
      ...req.body,
      ...(updatedRisk ? {
        riskScore: updatedRisk.riskScore,
        riskLevel: updatedRisk.riskLevel,
        urgency: updatedRisk.urgency,
        remainingSafeHours: updatedRisk.remainingSafeHours
      } : {})
    };

    const updated = await FoodListing.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Listing updated successfully", listing: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (req.user.role !== "admin" && String(listing.donorId) !== String(req.user._id || req.user.id)) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this listing" });
    }

    await FoodListing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Food listing deleted successfully" });
  } catch (error) {
    next(error);
  }
};

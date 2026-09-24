import { Claim } from "../models/Claim.js";
import { FoodListing } from "../models/FoodListing.js";
import { User } from "../models/User.js";
import { Pickup } from "../models/Pickup.js";
import { Notification } from "../models/Notification.js";

export const createClaim = async (req, res, next) => {
  try {
    const { listingId, quantity, pickupTime, pickupNotes } = req.body;
    const recipient = req.user;

    if (!listingId) {
      return res.status(400).json({ success: false, message: "Listing ID is required." });
    }

    const listing = await FoodListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Food listing not found." });
    }

    // Concurrency / duplicate claim guard
    if (listing.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: `This food listing is already ${listing.status.toLowerCase()} and cannot be claimed.`
      });
    }

    const requestedQty = Number(quantity) || listing.quantity;

    // Atomically transition listing to CLAIMED
    await FoodListing.findByIdAndUpdate(listingId, {
      status: "CLAIMED",
      claimedBy: recipient._id || recipient.id,
      claimedAt: new Date()
    });

    const claim = await Claim.create({
      listingId,
      donorId: listing.donorId,
      recipientId: recipient._id || recipient.id,
      recipientName: recipient.name,
      recipientOrg: recipient.organizationName || recipient.name,
      recipientPhone: recipient.phone || "",
      quantity: requestedQty,
      status: "CONFIRMED",
      pickupTime: pickupTime ? new Date(pickupTime) : new Date(Date.now() + 2 * 3600 * 1000),
      pickupNotes: pickupNotes || "Standard collection vehicle."
    });

    // Notify Donor
    await Notification.create({
      userId: listing.donorId,
      title: "New Surplus Claim Received!",
      message: `${recipient.organizationName || recipient.name} has claimed ${requestedQty} ${listing.unit} of ${listing.foodName}.`,
      type: "claim",
      link: "/donor/claims"
    });

    // Notify Recipient
    await Notification.create({
      userId: recipient._id || recipient.id,
      title: "Claim Confirmed!",
      message: `You successfully claimed ${requestedQty} ${listing.unit} of ${listing.foodName} from ${listing.donorOrg}.`,
      type: "confirmation",
      link: "/recipient/claims"
    });

    res.status(201).json({
      success: true,
      message: "Food claimed successfully! Collection coordination initiated.",
      claim
    });
  } catch (error) {
    next(error);
  }
};

export const getMyClaims = async (req, res, next) => {
  try {
    const recipientId = req.user._id || req.user.id;
    const claims = await Claim.find({ recipientId });

    // Populate listing and donor details
    const populated = await Promise.all(
      claims.map(async (claim) => {
        const listing = await FoodListing.findById(claim.listingId);
        const donor = await User.findById(claim.donorId);
        return {
          ...claim,
          listing,
          donor: donor ? {
            name: donor.name,
            organizationName: donor.organizationName,
            phone: donor.phone,
            location: donor.location
          } : null
        };
      })
    );

    // Sort descending by claim date
    populated.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    res.json({ success: true, count: populated.length, claims: populated });
  } catch (error) {
    next(error);
  }
};

export const getDonorClaims = async (req, res, next) => {
  try {
    const donorId = req.user._id || req.user.id;
    const claims = await Claim.find({ donorId });

    const populated = await Promise.all(
      claims.map(async (claim) => {
        const listing = await FoodListing.findById(claim.listingId);
        const recipient = await User.findById(claim.recipientId);
        return {
          ...claim,
          listing,
          recipient: recipient ? {
            name: recipient.name,
            organizationName: recipient.organizationName,
            phone: recipient.phone,
            location: recipient.location
          } : null
        };
      })
    );

    populated.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    res.json({ success: true, count: populated.length, claims: populated });
  } catch (error) {
    next(error);
  }
};

export const updateClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, pickupTime, pickupNotes } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    const listing = await FoodListing.findById(claim.listingId);

    const updateData = { status };
    if (pickupTime) updateData.pickupTime = new Date(pickupTime);
    if (pickupNotes) updateData.pickupNotes = pickupNotes;
    if (status === "COMPLETED") updateData.completedAt = new Date();

    const updatedClaim = await Claim.findByIdAndUpdate(id, updateData, { new: true });

    // Update listing status accordingly
    if (status === "PICKUP_SCHEDULED") {
      await FoodListing.findByIdAndUpdate(claim.listingId, { status: "PICKUP_SCHEDULED" });

      // Create Pickup record
      await Pickup.create({
        claimId: claim._id || claim.id,
        listingId: claim.listingId,
        donorId: claim.donorId,
        recipientId: claim.recipientId,
        status: "SCHEDULED",
        scheduledTime: pickupTime ? new Date(pickupTime) : new Date(Date.now() + 2 * 3600 * 1000),
        pickupNotes: pickupNotes || "Pickup scheduled and confirmed."
      });

      // Send notifications
      await Notification.create({
        userId: claim.recipientId,
        title: "Pickup Confirmed by Donor",
        message: `Pickup confirmed for ${listing?.foodName || "food surplus"}.`,
        type: "pickup",
        link: "/recipient/pickups"
      });
    } else if (status === "COMPLETED") {
      await FoodListing.findByIdAndUpdate(claim.listingId, { status: "COMPLETED" });

      // Calculate and update rescued impact metrics
      const quantityRescued = Number(claim.quantity) || 20;
      const wasteKg = Math.round(quantityRescued * 0.5); // Approx 0.5 kg per meal
      const co2Kg = Math.round(quantityRescued * 1.25);  // Approx 1.25 kg CO2e saved per meal

      const donor = await User.findById(claim.donorId);
      if (donor) {
        await User.findByIdAndUpdate(claim.donorId, {
          "metrics.mealsRescued": (donor.metrics?.mealsRescued || 0) + quantityRescued,
          "metrics.wastePreventedKg": (donor.metrics?.wastePreventedKg || 0) + wasteKg,
          "metrics.co2OffsetKg": (donor.metrics?.co2OffsetKg || 0) + co2Kg
        });
      }

      const recipient = await User.findById(claim.recipientId);
      if (recipient) {
        await User.findByIdAndUpdate(claim.recipientId, {
          "metrics.claimsCount": (recipient.metrics?.claimsCount || 0) + 1,
          "metrics.mealsRescued": (recipient.metrics?.mealsRescued || 0) + quantityRescued,
          "metrics.wastePreventedKg": (recipient.metrics?.wastePreventedKg || 0) + wasteKg,
          "metrics.co2OffsetKg": (recipient.metrics?.co2OffsetKg || 0) + co2Kg
        });
      }

      await Notification.create({
        userId: claim.donorId,
        title: "Rescue Mission Completed! ??",
        message: `Successfully completed handover of ${quantityRescued} meals to ${claim.recipientOrg}. You saved ${wasteKg}kg of food!`,
        type: "confirmation",
        link: "/donor/history"
      });

      await Notification.create({
        userId: claim.recipientId,
        title: "Rescue Handover Complete! ??",
        message: `Received ${quantityRescued} meals from ${listing?.donorOrg || "Donor"}. Impact credited to your profile.`,
        type: "confirmation",
        link: "/recipient/history"
      });
    } else if (status === "CANCELLED") {
      // Revert listing to AVAILABLE
      await FoodListing.findByIdAndUpdate(claim.listingId, {
        status: "AVAILABLE",
        claimedBy: null,
        claimedAt: null
      });

      await Notification.create({
        userId: claim.donorId,
        title: "Claim Cancelled",
        message: `Claim for ${listing?.foodName || "listing"} was cancelled. Food is once again AVAILABLE on the map.`,
        type: "system",
        link: "/donor/listings"
      });
    }

    res.json({
      success: true,
      message: `Claim updated to ${status}`,
      claim: updatedClaim
    });
  } catch (error) {
    next(error);
  }
};

export const getAllClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find();
    const populated = await Promise.all(
      claims.map(async (claim) => {
        const listing = await FoodListing.findById(claim.listingId);
        const donor = await User.findById(claim.donorId);
        const recipient = await User.findById(claim.recipientId);
        return {
          ...claim,
          listing,
          donor: donor ? { name: donor.name, organizationName: donor.organizationName } : null,
          recipient: recipient ? { name: recipient.name, organizationName: recipient.organizationName } : null
        };
      })
    );
    res.json({ success: true, count: populated.length, claims: populated });
  } catch (error) {
    next(error);
  }
};

import { Pickup } from "../models/Pickup.js";
import { Claim } from "../models/Claim.js";
import { FoodListing } from "../models/FoodListing.js";
import { User } from "../models/User.js";
import { optimizePickupRoute } from "../services/aiLocalService.js";

export const getPickups = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    let filter = {};
    if (role === "donor") filter.donorId = userId;
    if (role === "recipient") filter.recipientId = userId;

    const pickups = await Pickup.find(filter);

    const populated = await Promise.all(
      pickups.map(async (pickup) => {
        const claim = await Claim.findById(pickup.claimId);
        const listing = pickup.listingId ? await FoodListing.findById(pickup.listingId) : null;
        const donor = await User.findById(pickup.donorId);
        const recipient = await User.findById(pickup.recipientId);

        return {
          ...pickup,
          claim,
          listing,
          donor: donor ? { name: donor.name, organizationName: donor.organizationName, phone: donor.phone, location: donor.location } : null,
          recipient: recipient ? { name: recipient.name, organizationName: recipient.organizationName, phone: recipient.phone, location: recipient.location } : null
        };
      })
    );

    res.json({ success: true, count: populated.length, pickups: populated });
  } catch (error) {
    next(error);
  }
};

export const planOptimalRoute = async (req, res, next) => {
  try {
    const { stops } = req.body;
    const recipient = req.user;

    const origin = {
      name: recipient.organizationName || recipient.name,
      coordinates: recipient.location?.coordinates || [28.6320, 77.2180]
    };

    const routeOptimization = await optimizePickupRoute({
      origin,
      stops: stops || []
    });

    res.json({
      success: true,
      data: routeOptimization
    });
  } catch (error) {
    next(error);
  }
};

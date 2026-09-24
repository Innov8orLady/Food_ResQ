import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { FoodListing } from "../models/FoodListing.js";
import { Claim } from "../models/Claim.js";
import { Pickup } from "../models/Pickup.js";
import { Notification } from "../models/Notification.js";
import { DemandForecast } from "../models/DemandForecast.js";

const FAKE_EMAILS = [
  "donor@foodresq.org",
  "recipient@foodresq.org",
  "communitycare@foodresq.org",
  "helpinghands@foodresq.org",
  "delhibakes@foodresq.org",
  "hacker@test.com",
  "tester99@foodresq.org",
  "priya.patel@rescuenet.org"
];

/**
 * Purge all fake demo listings, claims, pickups, notifications, and demo accounts.
 */
export async function purgeAllFakeRecords() {
  try {
    // 1. Remove all mock listings, claims, pickups, notifications, and forecasts
    await FoodListing.deleteMany({});
    await Claim.deleteMany({});
    await Pickup.deleteMany({});
    await Notification.deleteMany({});
    await DemandForecast.deleteMany({});

    // 2. Remove all legacy demo accounts
    for (const email of FAKE_EMAILS) {
      const user = await User.findOne({ email });
      if (user) {
        await User.findByIdAndDelete(user._id || user.id);
      }
    }

    // 3. Reset any admin metrics to zero
    const adminUser = await User.findOne({ email: "admin@foodresq.org" });
    if (adminUser) {
      await User.findByIdAndUpdate(adminUser._id || adminUser.id, {
        metrics: {
          donationsCount: 0,
          claimsCount: 0,
          mealsRescued: 0,
          wastePreventedKg: 0,
          co2OffsetKg: 0
        }
      });
    }

    console.log("[Seed] All fake records successfully purged. Platform is in clean production state.");
  } catch (err) {
    console.warn("[Seed] Warning while purging fake records:", err.message);
  }
}

/**
 * Ensure clean system initialization with only the Platform Administrator.
 */
export async function seedDatabase() {
  try {
    // Always purge fake demo accounts and mock listings
    await purgeAllFakeRecords();

    // Check if the administrator account exists
    let adminUser = await User.findOne({ email: "admin@foodresq.org" });

    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!adminUser) {
      console.log("[Seed] Initializing clean Platform Administrator account...");
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash(adminPassword, salt);

      adminUser = await User.create({
        name: "FoodResQ Operations",
        email: "admin@foodresq.org",
        password: adminPass,
        role: "admin",
        phone: "+91 11 2345 6789",
        organizationName: "FoodResQ Central Command",
        organizationType: "Platform Administration",
        location: {
          address: "Technology Hub, Barakhamba Road",
          city: "Delhi NCR",
          coordinates: [28.6289, 77.2280]
        },
        verified: true,
        metrics: {
          donationsCount: 0,
          claimsCount: 0,
          mealsRescued: 0,
          wastePreventedKg: 0,
          co2OffsetKg: 0
        }
      });
      console.log("[Seed] Platform Administrator created successfully.");
    } else {
      // Sync admin password if ADMIN_PASSWORD is set or changed
      if (process.env.ADMIN_PASSWORD) {
        const isMatch = await bcrypt.compare(process.env.ADMIN_PASSWORD, adminUser.password);
        if (!isMatch) {
          const salt = await bcrypt.genSalt(10);
          const newHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
          await User.findByIdAndUpdate(adminUser._id || adminUser.id, { password: newHash });
          console.log("[Seed] Admin password synchronized from ADMIN_PASSWORD env variable.");
        }
      }
    }
  } catch (error) {
    console.error("[Seed] Initialization error:", error);
  }
}

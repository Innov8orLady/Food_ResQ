import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { FoodListing } from "../models/FoodListing.js";
import { Claim } from "../models/Claim.js";
import { Pickup } from "../models/Pickup.js";
import { Notification } from "../models/Notification.js";
import { DemandForecast } from "../models/DemandForecast.js";
import { predictRisk, recognizeFood } from "./aiLocalService.js";

export async function seedDatabase() {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      if (process.env.ADMIN_PASSWORD) {
        const adminUser = await User.findOne({ email: "admin@foodresq.org" });
        if (adminUser) {
          const isMatch = await bcrypt.compare(process.env.ADMIN_PASSWORD, adminUser.password);
          if (!isMatch) {
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
            await User.findByIdAndUpdate(adminUser._id || adminUser.id, { password: newHash });
            console.log("[Seed] Admin password updated from ADMIN_PASSWORD environment variable.");
          }
        }
      }
      return;
    }

    console.log("[Seed] Seeding initial demo users and listings...");

    const salt = await bcrypt.genSalt(10);
    const donorPass = await bcrypt.hash("password123", salt);
    const recipientPass = await bcrypt.hash("password123", salt);
    const adminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", salt);

    // 1. Create Core Users
    const donorUser = await User.create({
      name: "Rajesh Sharma",
      email: "donor@foodresq.org",
      password: donorPass,
      role: "donor",
      phone: "+91 98112 34567",
      organizationName: "Green Leaf Restaurant & Banquets",
      organizationType: "Restaurant",
      location: {
        address: "14 Rajpur Road, Civil Lines",
        city: "Delhi NCR",
        coordinates: [28.6750, 77.2250]
      },
      verified: true,
      metrics: {
        donationsCount: 14,
        claimsCount: 0,
        mealsRescued: 420,
        wastePreventedKg: 210,
        co2OffsetKg: 525
      }
    });

    const recipientUser = await User.create({
      name: "Sister Mary & Team",
      email: "recipient@foodresq.org",
      password: recipientPass,
      role: "recipient",
      phone: "+91 98234 56789",
      organizationName: "Hope Shelter & Food Bank",
      organizationType: "Shelter",
      location: {
        address: "Block B, Connaught Place",
        city: "Delhi NCR",
        coordinates: [28.6320, 77.2180]
      },
      capacity: 80,
      dietaryPreferences: ["Vegetarian", "Non-Vegetarian"],
      verified: true,
      metrics: {
        donationsCount: 0,
        claimsCount: 18,
        mealsRescued: 540,
        wastePreventedKg: 270,
        co2OffsetKg: 675
      }
    });

    const adminUser = await User.create({
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
        mealsRescued: 2850,
        wastePreventedKg: 1420,
        co2OffsetKg: 3550
      }
    });

    // Additional Community Recipients for Rich Matching
    const ngo2 = await User.create({
      name: "Amit Verma",
      email: "communitycare@foodresq.org",
      password: recipientPass,
      role: "recipient",
      phone: "+91 98345 67890",
      organizationName: "Community Care Foundation",
      organizationType: "NGO",
      location: {
        address: "Pusa Road, Karol Bagh",
        city: "Delhi NCR",
        coordinates: [28.6515, 77.1906]
      },
      capacity: 50,
      dietaryPreferences: ["Vegetarian"],
      verified: true,
      metrics: { donationsCount: 0, claimsCount: 8, mealsRescued: 210, wastePreventedKg: 105, co2OffsetKg: 260 }
    });

    const ngo3 = await User.create({
      name: "Pooja Malhotra",
      email: "helpinghands@foodresq.org",
      password: recipientPass,
      role: "recipient",
      phone: "+91 98456 78901",
      organizationName: "Helping Hands Relief Centre",
      organizationType: "Community Kitchen",
      location: {
        address: "Ring Road, Lajpat Nagar",
        city: "Delhi NCR",
        coordinates: [28.5700, 77.2400]
      },
      capacity: 120,
      dietaryPreferences: ["Vegetarian", "Non-Vegetarian"],
      verified: true,
      metrics: { donationsCount: 0, claimsCount: 22, mealsRescued: 780, wastePreventedKg: 390, co2OffsetKg: 975 }
    });

    // Additional Donors
    const donor2 = await User.create({
      name: "Sunil Bakshi",
      email: "delhibakes@foodresq.org",
      password: donorPass,
      role: "donor",
      phone: "+91 98567 89012",
      organizationName: "The Grand Artisan Bakery",
      organizationType: "Bakery",
      location: {
        address: "Khan Market, Rabindra Nagar",
        city: "Delhi NCR",
        coordinates: [28.6000, 77.2270]
      },
      verified: true,
      metrics: { donationsCount: 9, claimsCount: 0, mealsRescued: 180, wastePreventedKg: 90, co2OffsetKg: 225 }
    });

    // 2. Create Realistic Food Listings with AI Analysis
    const now = new Date();

    // Listing 1: Cooked Meal (Freshly prepared, Available)
    const risk1 = await predictRisk({
      foodName: "Dal Makhani, Rice & Butter Roti Packets",
      category: "Cooked Meals",
      preparationTime: new Date(now.getTime() - 2 * 3600 * 1000),
      storageCondition: "Hot Holding (>60�C)",
      packagingType: "Sealed Food Containers",
      dietaryType: "Vegetarian"
    });

    const listing1 = await FoodListing.create({
      donorId: donorUser._id,
      donorName: donorUser.name,
      donorOrg: donorUser.organizationName,
      donorPhone: donorUser.phone,
      foodName: "Dal Makhani, Rice & Butter Roti Packets",
      category: "Cooked Meals",
      quantity: 35,
      unit: "meals/packets",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60",
      preparationTime: new Date(now.getTime() - 2 * 3600 * 1000),
      availableFrom: new Date(now.getTime() - 1 * 3600 * 1000),
      availableUntil: new Date(now.getTime() + 4 * 3600 * 1000),
      location: donorUser.location,
      storageCondition: "Hot Holding (>60�C)",
      packagingType: "Sealed Food Containers",
      dietaryType: "Vegetarian",
      description: "Surplus freshly prepared banquet dinner meal boxes. Each packet contains Dal Makhani, Jeera Rice, 2 Roti, and Salad. Sealed hot.",
      riskScore: risk1.riskScore,
      riskLevel: risk1.riskLevel,
      urgency: risk1.urgency,
      remainingSafeHours: risk1.remainingSafeHours,
      aiRecognition: {
        detectedItem: "North Indian Thali / Rice & Dal",
        confidence: 94,
        suggestedCategory: "Cooked Meals",
        tags: ["Cooked", "Staple", "High Demand"],
        isDemo: true
      },
      status: "AVAILABLE"
    });

    // Listing 2: Urgent Cooked Food (Room temperature banquet surplus)
    const risk2 = await predictRisk({
      foodName: "Paneer Butter Masala & Biryani Trays",
      category: "Cooked Meals",
      preparationTime: new Date(now.getTime() - 4 * 3600 * 1000),
      storageCondition: "Room Temperature",
      packagingType: "Foil Wrapped",
      dietaryType: "Vegetarian"
    });

    const listing2 = await FoodListing.create({
      donorId: donorUser._id,
      donorName: donorUser.name,
      donorOrg: donorUser.organizationName,
      donorPhone: donorUser.phone,
      foodName: "Paneer Butter Masala & Veg Biryani Trays",
      category: "Cooked Meals",
      quantity: 50,
      unit: "servings",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60",
      preparationTime: new Date(now.getTime() - 4 * 3600 * 1000),
      availableFrom: new Date(now.getTime() - 3 * 3600 * 1000),
      availableUntil: new Date(now.getTime() + 1.5 * 3600 * 1000),
      location: {
        address: "Civil Lines Club Road",
        city: "Delhi NCR",
        coordinates: [28.6790, 77.2210]
      },
      storageCondition: "Room Temperature",
      packagingType: "Foil Wrapped",
      dietaryType: "Vegetarian",
      description: "Buffet surplus from midday corporate seminar. High quality, foil-covered catering trays. Urgently needs distribution within 90 minutes.",
      riskScore: risk2.riskScore,
      riskLevel: risk2.riskLevel,
      urgency: "URGENT",
      remainingSafeHours: risk2.remainingSafeHours,
      aiRecognition: {
        detectedItem: "Biryani & Curry Trays",
        confidence: 91,
        suggestedCategory: "Cooked Meals",
        tags: ["Cooked", "Buffet", "Perishable"],
        isDemo: true
      },
      status: "AVAILABLE"
    });

    // Listing 3: Bakery Goods (Longer shelf life)
    const risk3 = await predictRisk({
      foodName: "Assorted Multigrain Bread, Buns & Croissants",
      category: "Bakery & Bread",
      preparationTime: new Date(now.getTime() - 6 * 3600 * 1000),
      storageCondition: "Room Temperature",
      packagingType: "Commercial Packaging",
      dietaryType: "Vegetarian"
    });

    const listing3 = await FoodListing.create({
      donorId: donor2._id,
      donorName: donor2.name,
      donorOrg: donor2.organizationName,
      donorPhone: donor2.phone,
      foodName: "Assorted Multigrain Bread, Buns & Croissants",
      category: "Bakery & Bread",
      quantity: 45,
      unit: "boxes",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60",
      preparationTime: new Date(now.getTime() - 6 * 3600 * 1000),
      availableFrom: new Date(now.getTime() - 2 * 3600 * 1000),
      availableUntil: new Date(now.getTime() + 28 * 3600 * 1000),
      location: donor2.location,
      storageCondition: "Room Temperature",
      packagingType: "Commercial Packaging",
      dietaryType: "Vegetarian",
      description: "Daily bakery batch surplus. Unsold artisan baguettes, dinner rolls, and plain croissants in sealed paper packaging.",
      riskScore: risk3.riskScore,
      riskLevel: risk3.riskLevel,
      urgency: "NORMAL",
      remainingSafeHours: risk3.remainingSafeHours,
      aiRecognition: {
        detectedItem: "Bakery Assortment & Bread",
        confidence: 96,
        suggestedCategory: "Bakery & Bread",
        tags: ["Baked", "Ready to Eat", "Low Perishability"],
        isDemo: true
      },
      status: "AVAILABLE"
    });

    // Listing 4: Fresh Produce (Fruits & Veggies)
    const risk4 = await predictRisk({
      foodName: "Fresh Seasonal Fruit Crates (Apples, Bananas, Oranges)",
      category: "Fresh Produce",
      preparationTime: new Date(now.getTime() - 12 * 3600 * 1000),
      storageCondition: "Room Temperature",
      packagingType: "Open Bulk Tray",
      dietaryType: "Vegan"
    });

    const listing4 = await FoodListing.create({
      donorId: donorUser._id,
      donorName: donorUser.name,
      donorOrg: donorUser.organizationName,
      donorPhone: donorUser.phone,
      foodName: "Fresh Seasonal Fruit Crates (Apples, Bananas, Oranges)",
      category: "Fresh Produce",
      quantity: 25,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=60",
      preparationTime: new Date(now.getTime() - 12 * 3600 * 1000),
      availableFrom: new Date(now.getTime() - 4 * 3600 * 1000),
      availableUntil: new Date(now.getTime() + 48 * 3600 * 1000),
      location: donorUser.location,
      storageCondition: "Room Temperature",
      packagingType: "Open Bulk Tray",
      dietaryType: "Vegan",
      description: "Surplus breakfast buffet fruit selection. Wholesome and intact, ideal for shelter breakfast or community kitchen.",
      riskScore: risk4.riskScore,
      riskLevel: risk4.riskLevel,
      urgency: "NORMAL",
      remainingSafeHours: risk4.remainingSafeHours,
      aiRecognition: {
        detectedItem: "Fresh Farm Produce & Fruit",
        confidence: 95,
        suggestedCategory: "Fresh Produce",
        tags: ["Fresh", "Raw", "Nutritious"],
        isDemo: true
      },
      status: "AVAILABLE"
    });

    // Listing 5: Claimed & Pickup Scheduled (To demonstrate workflow in UI)
    const risk5 = await predictRisk({
      foodName: "Steamed Rice, Yellow Dal & Mixed Veggies",
      category: "Cooked Meals",
      preparationTime: new Date(now.getTime() - 3 * 3600 * 1000),
      storageCondition: "Refrigerated",
      packagingType: "Sealed Food Containers",
      dietaryType: "Vegetarian"
    });

    const listing5 = await FoodListing.create({
      donorId: donorUser._id,
      donorName: donorUser.name,
      donorOrg: donorUser.organizationName,
      donorPhone: donorUser.phone,
      foodName: "Steamed Rice, Yellow Dal & Mixed Veggies",
      category: "Cooked Meals",
      quantity: 40,
      unit: "meals/packets",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60",
      preparationTime: new Date(now.getTime() - 3 * 3600 * 1000),
      availableFrom: new Date(now.getTime() - 2 * 3600 * 1000),
      availableUntil: new Date(now.getTime() + 8 * 3600 * 1000),
      location: donorUser.location,
      storageCondition: "Refrigerated",
      packagingType: "Sealed Food Containers",
      dietaryType: "Vegetarian",
      description: "Nutritious lunch meal boxes. Claimed by Hope Shelter for evening distribution.",
      riskScore: risk5.riskScore,
      riskLevel: risk5.riskLevel,
      urgency: risk5.urgency,
      remainingSafeHours: risk5.remainingSafeHours,
      status: "PICKUP_SCHEDULED",
      claimedBy: recipientUser._id,
      claimedAt: new Date(now.getTime() - 45 * 60 * 1000)
    });

    // 3. Create Sample Claim & Pickup Record
    const sampleClaim = await Claim.create({
      listingId: listing5._id,
      donorId: donorUser._id,
      recipientId: recipientUser._id,
      recipientName: recipientUser.name,
      recipientOrg: recipientUser.organizationName,
      recipientPhone: recipientUser.phone,
      quantity: 40,
      status: "PICKUP_SCHEDULED",
      pickupTime: new Date(now.getTime() + 90 * 60 * 1000),
      pickupNotes: "Volunteer van will arrive at back gate kitchen entrance.",
      claimedAt: new Date(now.getTime() - 45 * 60 * 1000)
    });

    await Pickup.create({
      claimId: sampleClaim._id,
      listingId: listing5._id,
      donorId: donorUser._id,
      recipientId: recipientUser._id,
      status: "SCHEDULED",
      scheduledTime: new Date(now.getTime() + 90 * 60 * 1000),
      pickupNotes: "Van registration DL 01 AB 4321. Driver: Ramesh.",
      route: {
        stops: [
          {
            name: donorUser.organizationName,
            address: donorUser.location.address,
            coordinates: donorUser.location.coordinates,
            urgency: "NORMAL",
            quantity: 40
          }
        ],
        totalDistanceKm: 5.2,
        totalDurationMin: 22,
        priorityOrder: [1]
      }
    });

    // 4. Create Initial In-App Notifications
    await Notification.create({
      userId: donorUser._id,
      title: "New Surplus Claimed!",
      message: `${recipientUser.organizationName} claimed your 40 meal packets of Steamed Rice & Dal.`,
      type: "claim",
      link: "/donor/claims",
      isRead: false
    });

    await Notification.create({
      userId: recipientUser._id,
      title: "Pickup Confirmed",
      message: `Pickup scheduled with ${donorUser.organizationName} at ${new Date(now.getTime() + 90 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      type: "pickup",
      link: "/recipient/pickups",
      isRead: false
    });

    await Notification.create({
      userId: recipientUser._id,
      title: "AI Alert: High Urgency Food Nearby",
      message: "50 servings of Paneer Butter Masala & Biryani Trays requires immediate pickup within 90 mins.",
      type: "match",
      link: "/recipient/nearby",
      isRead: false
    });

    // 5. Seed Initial Demand Forecast
    await DemandForecast.create({
      city: "Delhi NCR",
      forecastDate: new Date(now.getTime() + 86400000).toISOString().split("T")[0],
      predictedSurplusMeals: 72,
      highRiskWasteCategory: "Cooked Meals",
      surplusProbability: "High",
      confidenceScore: 89,
      recommendations: [
        "Alert nearby shelters in Delhi NCR for high anticipated surplus tomorrow.",
        "Advise commercial kitchens to prepare extra sealed transport containers for Cooked Meals.",
        "Pre-assign transport volunteers to the Civil Lines and Central zones."
      ],
      weeklyTrend: [
        { day: "Mon", predictedSurplusMeals: 38, historicalAvgMeals: 32, riskIndex: 40 },
        { day: "Tue", predictedSurplusMeals: 44, historicalAvgMeals: 39, riskIndex: 45 },
        { day: "Wed", predictedSurplusMeals: 52, historicalAvgMeals: 48, riskIndex: 55 },
        { day: "Thu", predictedSurplusMeals: 58, historicalAvgMeals: 50, riskIndex: 60 },
        { day: "Fri", predictedSurplusMeals: 78, historicalAvgMeals: 70, riskIndex: 80 },
        { day: "Sat", predictedSurplusMeals: 96, historicalAvgMeals: 85, riskIndex: 95 },
        { day: "Sun", predictedSurplusMeals: 88, historicalAvgMeals: 82, riskIndex: 90 }
      ]
    });

    console.log("[Seed] Seeding completed successfully with demo users, listings, claims, and AI models!");
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
  }
}

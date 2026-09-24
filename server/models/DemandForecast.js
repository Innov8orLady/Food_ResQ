import mongoose from "mongoose";
import { createModelWrapper } from "./dbHelper.js";

const DemandForecastSchema = new mongoose.Schema({
  city: { type: String, default: "Delhi NCR" },
  forecastDate: { type: String, required: true },
  predictedSurplusMeals: { type: Number, required: true },
  highRiskWasteCategory: { type: String, default: "Cooked Meals" },
  surplusProbability: { type: String, default: "High" },
  confidenceScore: { type: Number, default: 88 },
  recommendations: { type: [String], default: [] },
  weeklyTrend: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const DemandForecast = createModelWrapper("DemandForecast", DemandForecastSchema, "forecasts");

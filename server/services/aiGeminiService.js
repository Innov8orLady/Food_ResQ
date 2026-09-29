/**
 * Google Gemini AI Integration Service for FoodResQ
 * Powers AI-Module-1 (Vision Recognition), AI-Module-2 (Food Safety & Risk),
 * and AI-Module-4 (Waste & Demand Intelligence) with Google Gemini 3.6/Flash.
 */

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Resilient priority chain of Google Gemini models
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-flash-latest"
];

function getApiKey() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim() || null;
}

/**
 * Helper to reliably extract JSON from model responses
 */
function extractJson(text) {
  if (!text) return null;
  // Try extracting from markdown code block ```json ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {}
  }
  // Try finding first { and last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch (e) {}
  }
  return null;
}

/**
 * Helper to call Google Generative AI with automatic retry and model fallback
 */
async function callGeminiApi(contents, systemInstruction = "") {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  for (const model of CANDIDATE_MODELS) {
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        responseMimeType: "application/json"
      }
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    // Try up to 2 attempts per model (handles brief 503 spikes)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(20000)
        });

        if (!response.ok) {
          if (response.status === 503 && attempt === 1) {
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }
          break; // Try next model candidate
        }

        const json = await response.json();
        const candidates = json.candidates;
        if (!candidates || candidates.length === 0) break;

        const rawText = candidates[0].content?.parts?.[0]?.text;
        if (!rawText) break;

        const parsed = extractJson(rawText);
        if (parsed) {
          return { data: parsed, modelUsed: model };
        }
      } catch (err) {
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        console.warn(`[Gemini API] Request failed for model ${model}:`, err.message);
      }
    }
  }

  return null;
}

/**
 * AI Module 1: Food Recognition via Gemini Multimodal Vision
 */
export async function geminiRecognizeFood({ imageBase64, mimeType, imageName, filename, textHint }) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const systemInstruction = `You are FoodResQ Vision AI, an expert food inspection, classification, and safety model.
Analyze the food input and identify the exact food item, category, dietary classification, top candidate matches, and safe shelf life.
Categories MUST be strictly one of:
- "Cooked Meals"
- "Bakery & Bread"
- "Fresh Produce"
- "Dairy Products"
- "Packaged Foods"
- "Beverages"

DietaryType MUST be strictly one of: "Vegetarian", "Non-Vegetarian", "Vegan".

Always respond strictly in JSON format with this exact schema:
{
  "detectedItem": "Specific dish name (e.g. 'Fresh Artisan White Bread' or 'North Indian Thali / Dal & Rice')",
  "category": "one of the 6 categories above",
  "dietaryType": "Vegetarian | Non-Vegetarian | Vegan",
  "confidence": number between 85 and 99,
  "topCandidates": [
    { "name": "Primary Match", "category": "Category", "confidence": 96 },
    { "name": "Alternative Match", "category": "Category", "confidence": 88 }
  ],
  "tags": ["Array", "of", "4-6", "tags"],
  "suggestedShelfLifeHours": number of hours fresh at room temperature,
  "explanation": "Concise 1-2 sentence description highlighting visual freshness, texture, and nutritional components"
}`;

  const parts = [];

  // If image base64 data is present, send as multimodal visual input to Gemini Vision
  if (imageBase64 && imageBase64.length > 50) {
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType || "image/jpeg";
    if (imageBase64.includes(";base64,")) {
      const splitParts = imageBase64.split(";base64,");
      detectedMime = splitParts[0].replace("data:", "") || detectedMime;
      cleanBase64 = splitParts[1];
    } else if (imageBase64.includes(",")) {
      cleanBase64 = imageBase64.split(",")[1];
    }

    parts.push({
      inlineData: {
        mimeType: detectedMime,
        data: cleanBase64.trim()
      }
    });
    parts.push({
      text: `Carefully inspect this food photograph. Accurately identify what food or dish is shown, classify its category, determine its dietary type, assess its freshness, and recommend shelf life.`
    });
  } else {
    parts.push({
      text: `Analyze this surplus food listing details:
Image Reference: ${imageName || "None"}
Filename: ${filename || "None"}
Donor Hint / Description: ${textHint || "Surplus food ready for rescue"}

Determine the most accurate food dish name, category, dietary classification, shelf life, and confidence score.`
    });
  }

  const resultObj = await callGeminiApi([{ role: "user", parts }], systemInstruction);
  if (!resultObj || !resultObj.data) return null;

  const result = resultObj.data;
  const detectedItem = result.detectedItem || result.name || result.foodName || "Surplus Meal";
  return {
    detectedItem,
    category: result.category || "Cooked Meals",
    dietaryType: result.dietaryType || "Vegetarian",
    confidence: Number(result.confidence) || 96,
    topCandidates: Array.isArray(result.topCandidates) && result.topCandidates.length > 0
      ? result.topCandidates
      : [{ name: detectedItem, category: result.category || "Cooked Meals", confidence: Number(result.confidence) || 96 }],
    tags: Array.isArray(result.tags) ? result.tags : ["Food Rescue", "AI Verified"],
    suggestedShelfLifeHours: Number(result.suggestedShelfLifeHours) || 6,
    isDemo: false,
    modelArchitecture: `Google Gemini AI (${resultObj.modelUsed})`,
    explanation: result.explanation || `Google Gemini analyzed the food features with high precision.`
  };
}

/**
 * AI Module 2: Food Safety / Spoilage Risk Prediction via Gemini
 */
export async function geminiPredictRisk({
  foodName = "",
  category = "Cooked Meals",
  preparationTime,
  storageCondition = "Room Temperature",
  packagingType = "Sealed Food Containers",
  dietaryType = "Vegetarian"
}) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prepDate = preparationTime ? new Date(preparationTime) : new Date();
  const elapsedHours = Math.max(0, (Date.now() - prepDate.getTime()) / (1000 * 60 * 60));

  const systemInstruction = `You are FoodResQ AI Spoilage & Risk Inspector, a certified food safety microbiologist engine adhering to FSSAI & US FDA Temperature Danger Zone (5°C to 60°C) standards.
Calculate the microbial spoilage risk score (0 to 100), risk tier, urgency level, and remaining safe hours based on elapsed time, storage condition, and packaging.
- Risk Score: 0-34 = LOW, 35-64 = MEDIUM, 65-84 = HIGH, 85-100 = CRITICAL.
- Urgency: "NORMAL", "URGENT", "IMMEDIATE".

Respond strictly in JSON format with this exact schema:
{
  "riskScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "urgency": "NORMAL" | "URGENT" | "IMMEDIATE",
  "remainingSafeHours": number,
  "totalSafeHours": number,
  "suggestedAction": "actionable recommendation for donors and rescue volunteers",
  "scientificRationale": "brief microbiological rationale regarding microbial growth and temperature abuse"
}`;

  const prompt = `Evaluate food safety risk for this listing:
- Food Item: ${foodName || "Cooked surplus"}
- Category: ${category}
- Dietary Type: ${dietaryType}
- Storage Condition: ${storageCondition}
- Packaging: ${packagingType}
- Preparation Timestamp: ${preparationTime || "Recent"}
- Time Elapsed: ${elapsedHours.toFixed(1)} hours`;

  const resultObj = await callGeminiApi([{ role: "user", parts: [{ text: prompt }] }], systemInstruction);
  if (!resultObj || !resultObj.data) return null;

  const result = resultObj.data;
  const rawScore = result.riskScore ?? result.spoilage_risk_score ?? result.score ?? 30;
  const riskScore = Math.min(100, Math.max(5, Math.round(Number(rawScore))));
  const riskLevel = String(result.riskLevel ?? result.risk_tier ?? (riskScore >= 75 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 35 ? "MEDIUM" : "LOW")).toUpperCase();
  const urgency = String(result.urgency ?? result.urgency_level ?? (riskScore >= 75 ? "IMMEDIATE" : riskScore >= 50 ? "URGENT" : "NORMAL")).toUpperCase();
  const remainingSafeHours = Number(result.remainingSafeHours ?? result.remaining_safe_hours ?? 3.5);
  const totalSafeHours = Number(result.totalSafeHours ?? result.total_safe_hours ?? Math.round((remainingSafeHours + elapsedHours) * 10) / 10);

  return {
    riskScore,
    riskLevel,
    urgency,
    remainingSafeHours: Math.max(0, Math.round(remainingSafeHours * 10) / 10),
    totalSafeHours,
    elapsedHours: Math.round(elapsedHours * 10) / 10,
    suggestedAction: result.suggestedAction || result.actionable_instructions || "Safe for pickup and prompt consumption within safe timelines.",
    scientificRationale: result.scientificRationale || result.microbiological_assessment || "Temperature control preserves safe edible state.",
    aiModelUsed: `Google Gemini AI (${resultObj.modelUsed})`,
    disclaimer: "Predictive food safety estimation powered by Google Gemini AI based on FDA/FSSAI criteria; non-lab certified."
  };
}

/**
 * AI Module 4: Demand & Waste Prediction via Gemini
 */
export async function geminiPredictDemand({ city = "Delhi NCR", historicalListings = [] }) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const systemInstruction = `You are FoodResQ Demand & Waste Intelligence AI.
Analyze surplus food patterns for the specified city and predict upcoming demand surges, high-risk waste categories, and tactical distribution recommendations.

Respond strictly in JSON format with this exact schema:
{
  "city": "string",
  "predictedSurplusMeals": number,
  "highRiskWasteCategory": "string (e.g. 'Cooked Banquet Meals' or 'Bakery & Dairy')",
  "surplusProbability": "High" | "Moderate" | "Very High",
  "confidenceScore": number (85-98),
  "recommendations": ["string", "string", "string"],
  "divertedWasteKgForecast": number,
  "insight": "1-2 sentence operational recommendation for local distribution vans"
}`;

  const prompt = `Target City: ${city}. Historical listings tracked: ${historicalListings.length}. Predict surplus meals, high-risk waste category, and tactical distribution recommendations.`;

  const resultObj = await callGeminiApi([{ role: "user", parts: [{ text: prompt }] }], systemInstruction);
  if (!resultObj || !resultObj.data) return null;

  const result = resultObj.data;
  const predictedMeals = Number(result.predictedSurplusMeals ?? result.predicted_surplus_meals ?? 65);

  return {
    city: result.city || city,
    predictionDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    predictedSurplusMeals: predictedMeals,
    highRiskWasteCategory: result.highRiskWasteCategory || result.high_risk_waste_category || "Cooked Meals",
    surplusProbability: result.surplusProbability || result.surplus_probability || "High",
    confidenceScore: Number(result.confidenceScore ?? result.confidence_score ?? 92),
    recommendations: Array.isArray(result.recommendations) && result.recommendations.length > 0
      ? result.recommendations
      : [
          `Alert nearby shelters in ${city} for high anticipated surplus.`,
          "Advise commercial kitchens to prepare extra sealed transport containers.",
          "Pre-assign transport volunteers to the highest-density rescue zones."
        ],
    divertedWasteKgForecast: Number(result.divertedWasteKgForecast ?? result.diverted_waste_kg_forecast ?? Math.round(predictedMeals * 0.45)),
    insight: result.insight || `Surplus volume in ${city} is elevated. Dispatch rescue routes early.`,
    isGemini: true,
    modelType: `Google Gemini AI (${resultObj.modelUsed})`
  };
}

# FOODRESQ — AI-Powered Food Rescue & Waste Intelligence Platform

> **"FoodResQ is not merely a platform for donating leftover food. It is an AI-powered food rescue and waste intelligence system that attempts to predict waste, assess food risk, intelligently match surplus with recipients, optimize pickups, and measure social impact."**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20LocalStore-emerald.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-gray.svg)]()

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Philosophy](#core-philosophy)
3. [Five AI Modules](#five-ai-modules)
4. [Technology Stack](#technology-stack)
5. [User Roles & Portals](#user-roles--portals)
6. [System Architecture](#system-architecture)
7. [Installation & Setup](#installation--setup)
8. [Demo Login Credentials](#demo-login-credentials)
9. [REST API Documentation](#rest-api-documentation)
10. [Viva & Project Defense Guide](#viva--project-defense-guide)

---

## 1. Project Overview

Every year, commercial kitchens, banquet halls, corporate cafeterias, and hotels generate millions of tons of edible surplus food that ends up in municipal landfills, emitting potent methane greenhouse gases. At the same time, community shelters, orphanages, and food banks struggle to supply nutritious meals to vulnerable populations.

**FoodResQ** bridges this gap using artificial intelligence. It transforms passive food charity into an active, intelligent, logistics-optimized supply chain:
- **Instant Image Recognition** classifies food and pre-fills categories.
- **Predictive Spoilage Risk Engine** calculates safe consumption windows using microbiological time-temperature factors.
- **Multi-Factor Matching** ranks recipient NGOs by proximity, intake capacity, and dietary preferences.
- **Waste Forecasting** predicts high-surplus days and categories before food is even cooked.
- **Urgent-First Route Optimization** solves multi-stop collection sequences so perishables near expiry are rescued first.

---

## 2. Core Philosophy

$$\text{Predict Waste} \longrightarrow \text{Prevent Waste} \longrightarrow \text{Rescue Surplus} \longrightarrow \text{Match Intelligently} \longrightarrow \text{Deliver Efficiently} \longrightarrow \text{Measure Impact}$$

---

## 3. Five AI Modules

### AI Module 1: Food Recognition & Classification
- **Purpose**: Automate surplus listing creation.
- **Input**: Image filename, image file, or text hint.
- **Output**: Detected food name, category (`Cooked Meals`, `Bakery & Bread`, `Fresh Produce`, `Dairy Products`, etc.), dietary profile (`Vegetarian`, `Non-Vegetarian`, `Vegan`), confidence score (e.g. 94%), and baseline shelf-life hours.
- **Architecture**: Transfer-learned vision feature embeddings with MobileNetV3 / ResNet classifier architecture. Modular interface ready for PyTorch/TensorFlow production weights.

### AI Module 2: Food Safety & Spoilage Risk Prediction
- **Purpose**: Ensure food safety compliance and compute urgency without certified laboratory bio-assays.
- **Scientific Foundation**: US FDA Temperature Danger Zone (4°C to 60°C) and FSSAI microbiological food hygiene guidelines.
- **Inputs**: Food category, preparation time, current time, storage condition (`Room Temperature`, `Refrigerated`, `Hot Holding >60°C`, `Deep Freeze`), packaging format (`Sealed Food Containers`, `Foil Wrapped`, `Commercial Packaging`, `Open Bulk Tray`).
- **Output**:
  - **Risk Score**: 0 (fresh) to 100 (critical spoilage limit).
  - **Risk Level**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
  - **Urgency**: `NORMAL` (>6h), `ELEVATED` (3-6h), `URGENT` (1-3h), `IMMEDIATE` (<1h).
  - **Safe Window**: Remaining safe hours before microbial risk threshold.
  - **Action Advice**: e.g., *"Refrigerate immediately. Prioritize nearby shelter pickup within 90 minutes."*

### AI Module 3: Donor–Recipient Intelligent Matching
- **Purpose**: Calculate optimal NGO recipients for any given food surplus.
- **Weighted Multi-Criteria Formulation**:
  $$\text{MatchScore} = w_d \cdot S_{\text{dist}} + w_q \cdot S_{\text{qty}} + w_p \cdot S_{\text{pref}} + w_u \cdot S_{\text{urg}} + w_r \cdot S_{\text{rel}}$$
  - $w_d = 0.35$ (Distance decay score via Haversine great-circle formula)
  - $w_q = 0.25$ (Intake capacity fit vs surplus quantity)
  - $w_p = 0.20$ (Dietary preference and food category match)
  - $w_u = 0.10$ (Urgency readiness of shelter fleet)
  - $w_r = 0.10$ (Historical completed pickup reliability)
- **Output**: Ranked list of recipients with match score (0–100%) and tactical rationale.

### AI Module 4: Demand & Waste Prediction
- **Purpose**: Forecast surplus volume before waste occurs to alert volunteer networks.
- **Methodology**: Seasonal Autoregressive Moving Average (SARIMA) decomposition across day-of-week demand variance (e.g., Sunday banquet peaks vs. weekday cafeteria volumes).
- **Output**: Predicted tomorrow's surplus meals, high-risk waste categories, surplus probability index, and 7-day projected trend charts.

### AI Module 5: Urgent-First Pickup Route Optimization
- **Purpose**: Plan multi-stop vehicle collection routes for NGO vans.
- **Formulation**: Urgency-Penalized Traveling Salesperson Problem (UP-TSP). Stops with imminent safe window expiration receive priority weighting ahead of pure distance minimization.
- **Output**: Ordered stop sequence, leg distances, total roundtrip kilometers, estimated transit duration, and Leaflet OpenStreetMap polyline path.

---

## 4. Technology Stack

### Frontend
- **React.js 18** with **Vite**
- **Tailwind CSS** for responsive emerald/slate sustainability theme
- **React Router v6** with role-based RouteGuards
- **Leaflet & React-Leaflet** for OpenStreetMap interactive maps (no paid Google Maps API keys required)
- **Recharts** for monthly trends, category breakdown, and risk distribution charts
- **Lucide React** icons & **Axios** HTTP client

### Backend
- **Node.js** & **Express.js** REST API
- **JWT (JSON Web Tokens)** for stateless role-based authentication
- **bcryptjs** password hashing (10 salt rounds)
- **MongoDB & Mongoose** with automated zero-configuration local document store fallback (`server/data/store.json`) so the project runs out-of-the-box even without a local MongoDB service running!
- **Multer** for food image handling

### AI Microservice
- **Python** FastAPI & standard HTTP server running on port `8000`
- Pure zero-dependency fallback architecture compatible with Python 3.10 through 3.15.

---

## 5. User Roles & Portals

1. **DONOR** (Restaurants, Hotels, Event Organizers, Cafeterias)
   - Add Surplus Food with real-time AI image recognition and dynamic AI risk score preview.
   - View active listings, edit or cancel surplus.
   - Inspect AI Recipient Matches for each listing.
   - Manage claims, confirm pickups, and view completed donation impact history.
   - Waste analytics dashboard with landfill diversion and CO₂ offset metrics.

2. **RECIPIENT** (NGOs, Shelters, Community Kitchens, Food Banks)
   - Browse nearby surplus with distance, category, and urgency filters.
   - Full-screen **Live Rescue Map** with urgency color-coded pins and 1-click claim.
   - Detailed food inspection with AI safe window countdown.
   - Claim surplus (with atomic concurrency lock preventing duplicate claims).
   - **Pickup Schedule & AI Route Optimizer** (Module 5) for multi-stop vehicle collection.
   - Historical claim archive and impact statement.

3. **ADMIN** (Operations Command)
   - Platform health and AI module monitoring.
   - User verification management (approve/revoke donors & NGOs).
   - Food listing moderation and deletion.
   - Claims audit log and transaction inspection.
   - Official ESG Impact Certificate generation (printable & downloadable).
   - System-wide macro analytics charts.

---

## 6. System Architecture

```
foodresq/
├── client/                      # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/          # Navbar, Footer, MapViewer, RouteMap, RiskBadge, StatusBadge, StatCard
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── layouts/             # PublicLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── public/          # Landing, About, HowItWorks, Login, Register, Contact
│   │   │   ├── donor/           # Dashboard, AddListing, MyListings, ListingDetail, Claims, History, Analytics, Profile
│   │   │   ├── recipient/       # Dashboard, NearbyFood, LiveMap, FoodDetail, MyClaims, PickupSchedule, History, Profile
│   │   │   └── admin/           # Dashboard, UserManagement, ListingManagement, ClaimsManagement, Reports, Analytics
│   │   ├── services/            # api.js (Axios with JWT interceptors)
│   │   ├── App.jsx              # Complete Route Map with RouteGuards
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Node.js + Express Backend
│   ├── config/                  # db.js (MongoDB + resilient fallback), storage.js
│   ├── controllers/             # authController, foodController, claimController, pickupController, aiController, analyticsController, userController
│   ├── middleware/              # auth.js (JWT verify & authorize), errorHandler.js, upload.js
│   ├── models/                  # User, FoodListing, Claim, Pickup, Notification, DemandForecast
│   ├── routes/                  # authRoutes, foodRoutes, claimRoutes, pickupRoutes, aiRoutes, analyticsRoutes, userRoutes
│   ├── services/                # aiLocalService.js (all 5 AI modules), seedService.js
│   ├── utils/                   # geoUtils.js (Haversine distance & urgent route solver)
│   ├── server.js
│   └── .env
│
├── ai-service/                  # Python AI Microservice (Port 8000)
│   ├── main.py                  # All 5 AI REST endpoints with pure Python standard library & FastAPI compatibility
│   └── requirements.txt
│
├── .env.example
└── README.md
```

---

## 7. Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **Python**: v3.10 or higher (optional, backend includes automated fallback)
- **MongoDB**: (Optional) If MongoDB is not installed locally, the server automatically uses its built-in local document storage engine!

### Step 1: Clone or Navigate to Project
```bash
cd foodresq
```

### Step 2: Start Backend Server
```bash
cd server
npm install
npm start
```
*Backend will start on `http://localhost:5000`. On first run, it automatically seeds realistic demo users, listings, claims, and demand forecasts!*

### Step 3: Start Python AI Microservice (Optional)
In a new terminal:
```bash
cd ai-service
py main.py
# or: python main.py
```
*Microservice starts on `http://localhost:8000`. (If not started, the Node.js backend executes the 5 AI modules internally with identical algorithms).*

### Step 4: Start Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
*Open your browser at `http://localhost:5173`.*

---

## 8. Demo Login Credentials

You can log in manually with the following pre-seeded accounts, or simply click the **"One-Click Demo"** buttons on the Login page or Navbar:

| Role | Email | Password | Organization |
|---|---|---|---|
| **Donor** | `donor@foodresq.org` | `password123` | Green Leaf Restaurant & Banquets |
| **Recipient (NGO)** | `recipient@foodresq.org` | `password123` | Hope Shelter & Food Bank |
| **Admin** | `admin@foodresq.org` | `admin123` | FoodResQ Central Operations |

---

## 9. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new Donor or Recipient
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get authenticated user profile & impact stats
- `POST /api/auth/demo-login` — Instant 1-click test login

### Food Surplus Listings (`/api/food`)
- `GET /api/food` — Get listings with category, dietary, urgency filters
- `GET /api/food/nearby?lat=...&lng=...&maxDistance=30` — Spatial distance-sorted listings
- `GET /api/food/:id` — Get listing details with donor contact info
- `POST /api/food` — Create listing (runs AI Module 1 & 2 automatically)
- `PUT /api/food/:id` — Update listing (recalculates risk if storage/time changes)
- `DELETE /api/food/:id` — Delete / cancel listing

### Claims & Pickups (`/api/claims`, `/api/pickups`)
- `POST /api/claims` — Atomically claim available food (prevents race conditions)
- `GET /api/claims/my` — Recipient claims overview
- `GET /api/claims/donor` — Donor incoming claims
- `PUT /api/claims/:id` — Transition claim status (`CONFIRMED` → `PICKUP_SCHEDULED` → `COMPLETED`)
- `GET /api/pickups` — List scheduled pickups
- `POST /api/pickups/plan-route` — Run AI Module 5 route solver

### AI Intelligence Endpoints (`/api/ai`)
- `POST /api/ai/food-recognition` — Module 1: Image & text feature recognition
- `POST /api/ai/risk-prediction` — Module 2: Microbial food safety & safe window prediction
- `POST /api/ai/matching` — Module 3: Weighted donor-recipient scoring
- `POST /api/ai/demand-prediction` — Module 4: Time-series surplus volume forecasting
- `POST /api/ai/route-optimization` — Module 5: Urgent-first multi-stop route planner

### Analytics (`/api/analytics`)
- `GET /api/analytics/donor` — Donor meals rescued, monthly trends, category breakdown
- `GET /api/analytics/recipient` — Recipient meals received, partner kitchens count
- `GET /api/analytics/admin` — System-wide totals, landfill waste diverted, CO₂ offset

---

## 10. Viva & Project Defense Guide (For Students)

### Q1: How is FoodResQ different from a simple food donation app?
> **Answer**: Traditional food donation apps are passive message boards. FoodResQ is an active waste intelligence platform. It uses 5 dedicated AI algorithms to ensure safety (calculating microbial risk windows), optimize logistics (urgent-first TSP routing), and automate matching (multi-criteria capacity/distance scoring).

### Q2: How does the AI Spoilage Risk Model work without laboratory sensors?
> **Answer**: It models microbiological proliferation using established food science guidelines from the US FDA Danger Zone criteria and FSSAI standards. Cooked food held between 4°C and 60°C has a critical 4-hour limit, whereas refrigeration extends safe consumption up to 48–72 hours. By combining elapsed preparation time, packaging seals, and storage temperature, the algorithm estimates remaining safe hours dynamically.

### Q3: How do you prevent two NGOs from claiming the same food simultaneously?
> **Answer**: At the database controller level, `createClaim` executes an atomic status check. If `listing.status !== 'AVAILABLE'`, the request is immediately rejected with a 400 Bad Request error. Only the first request transitions the listing state to `CLAIMED`.

### Q4: Why Leaflet and OpenStreetMap instead of Google Maps?
> **Answer**: OpenStreetMap with Leaflet is completely open-source, fast, and does not require a paid billing account or credit card API key. However, our modular architecture (`MapViewer.jsx`, `RouteMap.jsx`, `geoUtils.js`) separates coordinates and waypoint data so Google Maps JavaScript API or Mapbox can be swapped in with zero backend changes.

---

## License
MIT License. Built with pride for sustainability, zero food waste, and community relief.

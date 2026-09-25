import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  UtensilsCrossed, Sparkles, ShieldAlert, GitMerge, LineChart, Navigation,
  ArrowRight, HeartHandshake, CheckCircle2, TrendingUp, Building2, MapPin
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mealsRescued: 0,
    donationsCompleted: 0,
    activeDonors: 0,
    organizationsHelped: 0,
    wastePreventedKg: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/analytics/admin');
        if (res.data.success) {
          const d = res.data.data;
          setStats({
            mealsRescued: d.totalMealsRescued || 0,
            donationsCompleted: d.completedClaims || 0,
            activeDonors: d.totalDonors || 0,
            organizationsHelped: d.totalRecipients || 0,
            wastePreventedKg: d.wastePreventedKg || 0
          });
        }
      } catch (e) {
        // use fallback defaults
      }
    };
    loadStats();
  }, []);

  const aiModules = [
    {
      id: 1,
      title: "AI Food Recognition",
      badge: "Vision AI",
      desc: "Instant image-based food classification, detecting dish type, dietary category, and base shelf life with over 90% confidence.",
      icon: UtensilsCrossed,
      color: "from-emerald-500 to-teal-600"
    },
    {
      id: 2,
      title: "Food Safety & Risk Prediction",
      badge: "Food Science AI",
      desc: "Microbial proliferation modeling based on elapsed time, storage condition, and ambient factors to predict safe consumption windows.",
      icon: ShieldAlert,
      color: "from-amber-500 to-orange-600"
    },
    {
      id: 3,
      title: "Intelligent Donor-Recipient Matching",
      badge: "Weighted Ranking",
      desc: "Multi-attribute algorithm matching surplus donations with recipient NGOs by proximity, intake capacity, and dietary compatibility.",
      icon: GitMerge,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 4,
      title: "Demand & Waste Prediction",
      badge: "Time-Series Forecasting",
      desc: "Analyzes day-of-week trends and banquet patterns to forecast upcoming surplus peaks and prevent food waste before it happens.",
      icon: LineChart,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 5,
      title: "Pickup Route Optimization",
      badge: "Urgent-First TSP",
      desc: "Heuristic route planner prioritizing critical perishables near expiry, minimizing collection distance and turnaround time.",
      icon: Navigation,
      color: "from-teal-500 to-cyan-600"
    }
  ];

  const workflow = [
    { step: "01", title: "Upload Surplus", desc: "Donors list excess food with quantity, prep time, and storage method." },
    { step: "02", title: "AI Analyzes Food", desc: "Vision AI categorizes food while Risk AI computes the safe pickup window." },
    { step: "03", title: "Smart NGO Matching", desc: "Platform scores nearby shelters and automatically ranks eligible recipients." },
    { step: "04", title: "Claim & Confirm", desc: "NGO reserves the food with zero duplicate collisions." },
    { step: "05", title: "Optimized Route", desc: "Pickup order prioritizes urgent perishables for rapid vehicle transit." },
    { step: "06", title: "Impact Measured", desc: "Meals rescued, landfill waste averted, and CO2 offsets recorded." }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section with Auto-Adjusted Background Photo */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Real Visible Background Photo */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="/background.jpeg"
            alt="Children enjoying nutritious food"
            className="w-full h-full object-cover object-center filter brightness-[0.95] saturate-110"
          />
          {/* Auto-Adjusted Visibility Overlay: Soft daylight gradient that ensures full text contrast while showing the children clearly */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-emerald-50/60 to-slate-50/80 backdrop-blur-[0.5px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-emerald-300 text-xs font-bold text-emerald-900 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI-POWERED FOOD RESCUE & WASTE INTELLIGENCE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Predict waste. Rescue surplus. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">
                Feed communities.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
              FoodResQ connects restaurants, hotels, cafeterias, and event organizers having surplus food with nearby NGOs, shelters, and community kitchens using five specialized AI models.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/register?role=recipient"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                Find Food (For NGOs) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register?role=donor"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/95 text-slate-800 border border-slate-300 hover:bg-white shadow-sm flex items-center gap-2 transition-all hover:scale-105"
              >
                Donate Food (For Restaurants)
              </Link>
            </div>
          </div>

          {/* Key Platform Stats Counter */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm text-center">
              <p className="text-3xl font-black text-emerald-600">{stats.mealsRescued.toLocaleString()}+</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Meals Rescued</p>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm text-center">
              <p className="text-3xl font-black text-slate-900">{stats.wastePreventedKg.toLocaleString()} kg</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Waste Prevented</p>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm text-center">
              <p className="text-3xl font-black text-emerald-600">{stats.activeDonors}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Active Donors</p>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm text-center">
              <p className="text-3xl font-black text-slate-900">{stats.organizationsHelped}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Shelters Helped</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5 AI Modules Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Intelligent Core
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
            Powered by Five Specialized AI Modules
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            FoodResQ goes far beyond simple food marketplaces by deploying real-time artificial intelligence to prevent spoilage, optimize pickups, and maximize nutrition transfer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiModules.slice(0, 3).map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${m.color} text-white flex items-center justify-center shadow-md mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {m.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{m.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
          {aiModules.slice(3).map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${m.color} text-white flex items-center justify-center shadow-md mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {m.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{m.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6-Step Workflow */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3">
              How FoodResQ Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From commercial kitchen surplus to verified community distribution in six seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflow.map((item, idx) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl relative">
                <span className="text-2xl font-black text-emerald-400 opacity-80">{item.step}</span>
                <h4 className="text-base font-bold text-white mt-2">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
            >
              Explore Full Technical Architecture <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-auth.jpg')" }}
        >
          {/* Emerald/Slate Deep Tone Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/85 to-teal-950/90 backdrop-blur-[1px]"></div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to turn excess food into real community impact?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto mt-3">
              Join hundreds of food businesses and non-profit shelters already using FoodResQ to eliminate food waste and fight hunger.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-emerald-800 hover:bg-slate-100 shadow-lg transition-all hover:scale-105"
              >
                Get Started for Free
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-800/60 text-white border border-emerald-400/40 hover:bg-emerald-800 transition-all"
              >
                Contact Operations Team
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
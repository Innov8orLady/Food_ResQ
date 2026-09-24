import React from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, MapPin, Truck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      role: "Donor Action",
      title: "Listing Surplus with AI Computer Vision",
      desc: "Restaurant or hotel chefs upload an image of surplus food. The AI Food Recognition engine identifies the food category, suggests meal descriptions, and pre-fills nutritional parameters."
    },
    {
      num: "02",
      role: "Safety Engine",
      title: "Predictive Spoilage Risk Calculation",
      desc: "The AI Food Safety module calculates elapsed time since preparation, incorporates storage temperature, and generates a dynamic AI Risk Score (0-100) and Safe Pickup Window."
    },
    {
      num: "03",
      role: "Matching System",
      title: "Multi-Criteria Recipient Matching",
      desc: "An intelligent weighted scoring engine evaluates nearby shelters, factoring in road distance, recipient intake capacity, dietary preferences, and historical reliability."
    },
    {
      num: "04",
      role: "NGO Claim",
      title: "Real-Time Map Discovery & 1-Click Claim",
      desc: "Verified NGOs browse nearby surplus on an interactive OpenStreetMap view, filtering by urgency and dietary needs. When claimed, the listing is locked atomically to prevent double bookings."
    },
    {
      num: "05",
      role: "Logistics Optimization",
      title: "Urgent-First Pickup Route Optimization",
      desc: "If an NGO van has multiple stops, AI Module 5 sequences the collection route using urgency-penalized traveling salesperson heuristics so high-risk food is collected first."
    },
    {
      num: "06",
      role: "Impact Audit",
      title: "Handover Confirmation & Impact Tracking",
      desc: "Upon delivery handover, the donor confirms completion. The platform credits meals rescued, kilograms of waste diverted from landfills, and CO2 emissions averted."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Process Flow
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">How FoodResQ Works</h1>
        <p className="text-sm text-slate-600">
          A high-efficiency protocol ensuring safety, speed, and real-time coordination.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-emerald-600/20">
              {s.num}
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{s.role}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{s.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
        >
          Join the Network Today <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
import React from 'react';
import { ShieldCheck, Target, Globe, Award, Sparkles, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Our Mission & Vision
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">About FoodResQ</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          FoodResQ is an AI-powered food rescue and waste intelligence platform built to bridge the gap between commercial surplus food and community hunger relief.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1.5">Zero Food Waste</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminating edible food waste by predicting surplus and connecting it to distribution networks before spoilage occurs.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1.5">AI-Powered Safety</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Scientific spoilage risk prediction ensuring that every claimed meal meets strict time-temperature safety guidelines.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1.5">UN SDG 12.3 Alignment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Actively supporting the United Nations Sustainable Development Goal to halve per capita global food waste by 2030.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4">
        <h2 className="text-2xl font-bold">The Core Philosophy</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-emerald-400">Predict waste → Prevent waste → Rescue surplus → Match intelligently → Deliver efficiently → Measure impact.</strong>
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Unlike static bulletin boards or basic surplus marketplaces, FoodResQ treats food surplus as a time-critical logistical problem. Using predictive AI, OpenStreetMap routing, and automated risk scoring, we optimize the entire rescue chain from kitchen door to community shelter.
        </p>
      </div>

    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  Users, UtensilsCrossed, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight,
  Sparkles, BarChart3, LineChart
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, fRes] = await Promise.all([
          api.get('/analytics/admin'),
          api.post('/ai/demand-prediction', { city: 'Delhi NCR' })
        ]);
        if (aRes.data.success) setAnalytics(aRes.data.data);
        if (fRes.data.success) setForecast(fRes.data.result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading Central Admin Operations Portal...</div>;

  const d = analytics || {
    totalUsers: 48,
    totalDonors: 28,
    totalRecipients: 20,
    totalListings: 142,
    activeListings: 12,
    totalClaims: 130,
    completedClaims: 118,
    totalMealsRescued: 2850,
    wastePreventedKg: 1425,
    co2OffsetKg: 3560
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md">
            Platform Command Center
          </span>
          <h1 className="text-2xl font-black mt-1">FoodResQ Central Admin</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            System health: Online • 5 AI Modules Active • Live Network Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 border border-slate-700"
          >
            User Verification
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm"
          >
            Full Analytics
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Platform Users" value={d.totalUsers} unit="entities" icon={Users} />
        <StatCard title="Total Meals Rescued" value={d.totalMealsRescued} unit="meals" icon={UtensilsCrossed} />
        <StatCard title="Total Landfill Diversion" value={d.wastePreventedKg} unit="kg" icon={CheckCircle2} />
        <StatCard title="CO₂ Offset" value={d.co2OffsetKg} unit="kg" icon={Sparkles} />
      </div>

      {/* AI Demand & Waste Prediction Highlight (Module 4) */}
      {forecast && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <LineChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">AI Module 4: Demand & Waste Prediction</h3>
                <p className="text-xs text-slate-500">Time-series forecasting for upcoming surplus surge</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
              {forecast.surplusProbability} Probability
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Tomorrow's Surplus</span>
              <p className="text-xl font-black text-purple-900 mt-0.5">{forecast.predictedSurplusMeals} meals</p>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">High-Risk Waste Category</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{forecast.highRiskWasteCategory}</p>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Model Confidence</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">{forecast.confidenceScore}%</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <p className="font-bold text-slate-800">AI Tactical Recommendations:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {forecast.recommendations?.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-1 block"
        >
          <Users className="w-5 h-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-sm text-slate-900">User Management</h4>
          <p className="text-xs text-slate-500">Verify commercial donor kitchens and recipient NGO credentials.</p>
        </Link>

        <Link
          to="/admin/listings"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-1 block"
        >
          <UtensilsCrossed className="w-5 h-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-sm text-slate-900">Listings Moderation</h4>
          <p className="text-xs text-slate-500">Monitor active food surplus, inspect AI risk alerts, cancel invalid listings.</p>
        </Link>

        <Link
          to="/admin/claims"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-1 block"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-sm text-slate-900">Claims & Logistics Audit</h4>
          <p className="text-xs text-slate-500">Full audit log of handover times, recipient acknowledgments, and impact receipts.</p>
        </Link>
      </div>

    </div>
  );
}
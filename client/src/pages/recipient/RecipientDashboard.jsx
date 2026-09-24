import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import {
  UtensilsCrossed, Search, Map, ListOrdered, Truck, Sparkles, Clock, AlertTriangle, ArrowRight
} from 'lucide-react';

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [urgentFood, setUrgentFood] = useState([]);
  const [activeClaims, setActiveClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, fRes, cRes] = await Promise.all([
          api.get('/analytics/recipient'),
          api.get('/food/nearby?maxDistance=30'),
          api.get('/claims/my')
        ]);
        if (aRes.data.success) setAnalytics(aRes.data.data);
        if (fRes.data.success) {
          setUrgentFood(fRes.data.listings.slice(0, 3));
        }
        if (cRes.data.success) {
          setActiveClaims(cRes.data.claims.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').slice(0, 3));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading recipient shelter portal...</div>;

  const d = analytics || {
    totalClaims: 18,
    completedClaims: 16,
    totalMealsReceived: 540,
    wastePreventedKg: 270,
    co2OffsetKg: 675,
    partnerDonorsCount: 8
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
            Recipient Hub / NGO
          </span>
          <h1 className="text-2xl font-black mt-1">{user.organizationName || user.name}</h1>
          <p className="text-xs text-emerald-100 mt-0.5">
            Intake Capacity: {user.capacity || 80} meals/day • {user.location?.city || "Delhi NCR"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/recipient/nearby"
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <Search className="w-4 h-4" /> Find Food
          </Link>
          <Link
            to="/recipient/map"
            className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-900 flex items-center gap-1.5"
          >
            <Map className="w-4 h-4" /> Live Map
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Meals Received" value={d.totalMealsReceived} unit="meals" icon={UtensilsCrossed} />
        <StatCard title="Active Claims" value={activeClaims.length} unit="claims" icon={ListOrdered} />
        <StatCard title="Partner Donors" value={d.partnerDonorsCount} unit="kitchens" icon={Sparkles} />
        <StatCard title="Waste Prevented" value={d.wastePreventedKg} unit="kg" icon={Truck} />
      </div>

      {/* Urgent Surplus Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">AI Urgent Rescue</span>
            <h3 className="font-bold text-sm text-slate-900">Nearby Surplus Available Now</h3>
          </div>
          <Link to="/recipient/nearby" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {urgentFood.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No available surplus food nearby right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgentFood.map((item) => (
              <div key={item._id || item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <RiskBadge riskLevel={item.riskLevel} urgency={item.urgency} riskScore={item.riskScore} />
                    {item.distanceKm !== undefined && (
                      <span className="text-[11px] font-bold text-slate-500">{item.distanceKm} km</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.foodName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{item.donorOrg || item.donorName}</p>
                  <p className="text-xs text-emerald-700 font-bold">{item.quantity} {item.unit}</p>
                </div>
                <Link
                  to={`/recipient/food/${item._id || item.id}`}
                  className="w-full py-2 text-center rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  View Details & Claim
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Pickups & Scheduled Collections */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Active Claim Handover Pipeline</h3>
          <Link to="/recipient/pickups" className="text-xs text-emerald-600 font-bold hover:underline">
            Route Optimizer (Module 5) →
          </Link>
        </div>

        {activeClaims.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No pending claims awaiting collection.</p>
        ) : (
          <div className="space-y-3">
            {activeClaims.map((c) => (
              <div key={c._id || c.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{c.listing?.foodName || "Surplus Food"}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Donor: {c.donor?.organizationName || "Commercial Kitchen"} • Qty: {c.quantity} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <Link
                    to="/recipient/claims"
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    View Timeline →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
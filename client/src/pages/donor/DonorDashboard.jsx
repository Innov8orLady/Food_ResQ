import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import {
  UtensilsCrossed, PlusCircle, CheckCircle2, AlertTriangle, ArrowRight,
  Sparkles, Clock, MapPin, Package
} from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aRes, lRes, cRes] = await Promise.all([
          api.get('/analytics/donor'),
          api.get('/food?donorId=' + (user._id || user.id)),
          api.get('/claims/donor')
        ]);
        if (aRes.data.success) setAnalytics(aRes.data.data);
        if (lRes.data.success) {
          setActiveListings(lRes.data.listings.filter(l => l.status === 'AVAILABLE').slice(0, 4));
        }
        if (cRes.data.success) {
          setRecentClaims(cRes.data.claims.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading donor intelligence portal...</div>;
  }

  const metrics = analytics || {
    totalListings: 14,
    activeListings: 2,
    totalMealsRescued: 420,
    wastePreventedKg: 210,
    co2OffsetKg: 525
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
            Commercial Donor Hub
          </span>
          <h1 className="text-2xl font-black mt-1">{user.organizationName || user.name}</h1>
          <p className="text-xs text-emerald-100 mt-0.5">
            Real-time surplus monitoring, AI risk scoring, and verified NGO coordination.
          </p>
        </div>
        <Link
          to="/donor/add-food"
          className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 shadow-md flex items-center gap-2 transition-transform hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Add Surplus Food
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Meals Rescued" value={metrics.totalMealsRescued} unit="meals" icon={UtensilsCrossed} />
        <StatCard title="Active Listings" value={metrics.activeListings} unit="items" icon={Package} />
        <StatCard title="Waste Prevented" value={metrics.wastePreventedKg} unit="kg" icon={CheckCircle2} />
        <StatCard title="CO₂ Offset" value={metrics.co2OffsetKg} unit="kg" icon={Sparkles} />
      </div>

      {/* Active Listings Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Food Listings</h3>
            <p className="text-xs text-slate-500">Live surplus food currently discoverable by nearby NGOs</p>
          </div>
          <Link to="/donor/listings" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
            View All ({metrics.totalListings}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeListings.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No active surplus food listed right now.</p>
            <Link to="/donor/add-food" className="mt-2 inline-block text-xs text-emerald-600 font-bold hover:underline">
              + Post food surplus now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeListings.map((l) => (
              <div key={l._id || l.id} className="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={l.status} />
                  <RiskBadge riskLevel={l.riskLevel} urgency={l.urgency} riskScore={l.riskScore} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{l.foodName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{l.quantity} {l.unit} • {l.category}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Safe window: ~{l.remainingSafeHours}h
                  </span>
                  <Link to={`/donor/listings/${l._id || l.id}`} className="text-emerald-600 font-bold hover:underline">
                    View AI Matches →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Claims Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Claims & Handover Requests</h3>
            <p className="text-xs text-slate-500">Pickups requested or completed by verified shelter partners</p>
          </div>
          <Link to="/donor/claims" className="text-xs text-emerald-600 font-bold hover:underline">
            Manage All Claims →
          </Link>
        </div>

        {recentClaims.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No claims requested yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 font-bold">Food Item</th>
                  <th className="py-2.5 font-bold">Recipient NGO</th>
                  <th className="py-2.5 font-bold">Quantity</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentClaims.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-800">{c.listing?.foodName || "Food Surplus"}</td>
                    <td className="py-3 text-slate-600 font-medium">{c.recipient?.organizationName || c.recipientOrg}</td>
                    <td className="py-3 text-slate-600">{c.quantity} items</td>
                    <td className="py-3"><StatusBadge status={c.status} /></td>
                    <td className="py-3">
                      <Link to="/donor/claims" className="text-emerald-600 font-bold hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
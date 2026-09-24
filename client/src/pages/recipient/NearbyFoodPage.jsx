import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import { Search, Filter, MapPin, Clock, Package, CheckCircle2 } from 'lucide-react';

export default function NearbyFoodPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxDistance, setMaxDistance] = useState(25);
  const [category, setCategory] = useState('All');
  const [urgency, setUrgency] = useState('All');

  const fetchNearby = async () => {
    setLoading(true);
    try {
      let q = `/food/nearby?maxDistance=${maxDistance}`;
      if (category !== 'All') q += `&category=${category}`;
      if (urgency !== 'All') q += `&urgency=${urgency}`;
      const res = await api.get(q);
      if (res.data.success) {
        setListings(res.data.listings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [maxDistance, category, urgency]);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Nearby Surplus Food</h1>
          <p className="text-xs text-slate-500">Discover and claim commercial surplus before it reaches expiration</p>
        </div>
        <Link
          to="/recipient/map"
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-sm inline-flex items-center gap-1.5"
        >
          <MapPin className="w-4 h-4" /> Open Live Map View
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Max Distance: {maxDistance} km</label>
          <input
            type="range"
            min="2"
            max="60"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-36 accent-emerald-600"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Cooked Meals">Cooked Meals</option>
            <option value="Bakery & Bread">Bakery & Bread</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Dairy Products">Dairy Products</option>
            <option value="Packaged Foods">Packaged Foods</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Urgency Filter</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Urgencies</option>
            <option value="IMMEDIATE">Immediate Pickup (&lt;1h)</option>
            <option value="URGENT">Urgent (1-3h)</option>
            <option value="ELEVATED">Elevated (3-6h)</option>
            <option value="NORMAL">Normal (&gt;6h)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Finding available surplus within radius...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">No surplus food currently matches your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => (
            <div key={item._id || item.id} className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <RiskBadge riskLevel={item.riskLevel} urgency={item.urgency} riskScore={item.riskScore} />
                  {item.distanceKm !== undefined && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {item.distanceKm} km
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-1">{item.foodName}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.donorOrg || item.donorName}</p>
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2 rounded-xl">
                  <p className="font-bold text-emerald-700">{item.quantity} {item.unit}</p>
                  <p className="text-[11px] text-slate-500">Safe window: ~{item.remainingSafeHours} hours remaining</p>
                </div>
              </div>

              <Link
                to={`/recipient/food/${item._id || item.id}`}
                className="w-full py-2.5 text-center rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-sm block"
              >
                Inspect & Claim
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
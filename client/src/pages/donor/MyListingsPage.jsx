import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import { PlusCircle, Clock, Trash2, Eye } from 'lucide-react';

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchListings = async () => {
    try {
      const res = await api.get('/food?donorId=' + (user._id || user.id));
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
    fetchListings();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete('/food/' + id);
      setListings(prev => prev.filter(l => (l._id || l.id) !== id));
    } catch (e) {
      alert("Failed to delete listing");
    }
  };

  const filtered = statusFilter === 'All'
    ? listings
    : listings.filter(l => l.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Surplus Listings</h1>
          <p className="text-xs text-slate-500">Track, manage, and monitor AI risk status of all your donations</p>
        </div>
        <Link
          to="/donor/add-food"
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Add Surplus Food
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              statusFilter === st
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === 'All' ? 'All Listings' : st}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading listings...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">No listings found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <div key={l._id || l.id} className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={l.status} />
                  <RiskBadge riskLevel={l.riskLevel} urgency={l.urgency} riskScore={l.riskScore} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{l.foodName}</h3>
                <p className="text-xs text-slate-500">{l.quantity} {l.unit} • {l.category}</p>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>Storage: {l.storageCondition}</p>
                  <p>Safe window: ~{l.remainingSafeHours} hours</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/donor/listings/${l._id || l.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> AI Details & Matches
                </Link>
                {l.status === 'AVAILABLE' && (
                  <button
                    onClick={() => handleDelete(l._id || l.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
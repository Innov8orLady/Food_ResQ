import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { CalendarCheck, Phone, MapPin, CheckCircle2, Clock } from 'lucide-react';

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/claims/my');
      if (res.data.success) {
        setClaims(res.data.claims);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Food Claims</h1>
        <p className="text-xs text-slate-500">Track active reservations, pickup dispatch schedules, and collection confirmations</p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading claims...</p>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">No surplus claims created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((c) => (
            <div key={c._id || c.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{c.listing?.foodName || "Surplus Food"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Donor: <strong className="text-slate-800">{c.donor?.organizationName || "Commercial Donor"}</strong> ({c.quantity} items)
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pickup Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{c.donor?.location?.address || "Civil Lines, Delhi NCR"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Donor Phone</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{c.donor?.phone || "+91 98112 34567"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Time</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {c.pickupTime ? new Date(c.pickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Coordinating'}
                  </p>
                </div>
              </div>

              {/* Progress Pipeline */}
              <div className="pt-2 text-xs flex items-center justify-between text-slate-400 border-t border-slate-100">
                <span className={c.status === 'CONFIRMED' || c.status === 'PICKUP_SCHEDULED' || c.status === 'COMPLETED' ? 'font-bold text-emerald-600' : ''}>
                  1. Claimed ✓
                </span>
                <span>→</span>
                <span className={c.status === 'PICKUP_SCHEDULED' || c.status === 'COMPLETED' ? 'font-bold text-emerald-600' : ''}>
                  2. Pickup Scheduled {c.status === 'PICKUP_SCHEDULED' || c.status === 'COMPLETED' ? '✓' : ''}
                </span>
                <span>→</span>
                <span className={c.status === 'COMPLETED' ? 'font-bold text-purple-600' : ''}>
                  3. Handover Delivered {c.status === 'COMPLETED' ? '✓' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}